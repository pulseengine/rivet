//! `rivet init` — project scaffolding: presets and sample artifacts,
//! `--bootstrap` workspace tree, `--hooks` git hooks and `--agents`
//! AGENTS.md / CLAUDE.md generation.

use anyhow::{Context, Result};
use rivet_core::links::LinkGraph;
use rivet_core::schema::Severity;
use rivet_core::store::Store;
use rivet_core::validate;

use crate::{Cli, resolve_schemas_dir};

/// Preset configuration for `rivet init`.
struct InitPreset {
    schemas: Vec<&'static str>,
    /// Each entry: (filename, yaml_content)
    sample_files: Vec<(&'static str, &'static str)>,
}

fn resolve_preset(preset: &str) -> Result<InitPreset> {
    match preset {
        "dev" => Ok(InitPreset {
            schemas: vec!["common", "dev"],
            sample_files: vec![("requirements.yaml", DEV_SAMPLE)],
        }),
        "aspice" => Ok(InitPreset {
            schemas: vec!["common", "aspice"],
            sample_files: vec![("requirements.yaml", ASPICE_SAMPLE)],
        }),
        "stpa" => Ok(InitPreset {
            schemas: vec!["common", "stpa"],
            sample_files: vec![("safety.yaml", STPA_SAMPLE)],
        }),
        "cybersecurity" => Ok(InitPreset {
            schemas: vec!["common", "cybersecurity"],
            sample_files: vec![("security.yaml", CYBERSECURITY_SAMPLE)],
        }),
        "aadl" => Ok(InitPreset {
            schemas: vec!["common", "dev", "aadl"],
            sample_files: vec![("architecture.yaml", AADL_SAMPLE)],
        }),
        "eu-ai-act" => Ok(InitPreset {
            schemas: vec!["common", "eu-ai-act"],
            sample_files: vec![("ai-system.yaml", EU_AI_ACT_SAMPLE)],
        }),
        "safety-case" => Ok(InitPreset {
            schemas: vec!["common", "safety-case"],
            sample_files: vec![("safety-case.yaml", SAFETY_CASE_SAMPLE)],
        }),
        "stpa-ai" => Ok(InitPreset {
            schemas: vec!["common", "stpa", "stpa-ai"],
            sample_files: vec![("ml-safety.yaml", STPA_AI_SAMPLE)],
        }),
        "do-178c" => Ok(InitPreset {
            schemas: vec!["common", "do-178c"],
            sample_files: vec![("airborne-sw.yaml", DO_178C_SAMPLE)],
        }),
        "en-50128" => Ok(InitPreset {
            schemas: vec!["common", "en-50128"],
            sample_files: vec![("railway-sw.yaml", EN_50128_SAMPLE)],
        }),
        "iec-61508" => Ok(InitPreset {
            schemas: vec!["common", "iec-61508"],
            sample_files: vec![("safety.yaml", IEC_61508_SAMPLE)],
        }),
        "iec-62304" => Ok(InitPreset {
            schemas: vec!["common", "iec-62304"],
            sample_files: vec![("medical-sw.yaml", IEC_62304_SAMPLE)],
        }),
        "iso-pas-8800" => Ok(InitPreset {
            schemas: vec!["common", "iso-pas-8800"],
            sample_files: vec![("ai-safety.yaml", ISO_PAS_8800_SAMPLE)],
        }),
        "sotif" => Ok(InitPreset {
            schemas: vec!["common", "sotif"],
            sample_files: vec![("sotif-analysis.yaml", SOTIF_SAMPLE)],
        }),
        other => anyhow::bail!(
            "unknown preset: '{other}' (valid: dev, aspice, stpa, stpa-ai, cybersecurity, aadl, eu-ai-act, safety-case, do-178c, en-50128, iec-61508, iec-62304, iso-pas-8800, sotif)"
        ),
    }
}

const DEV_SAMPLE: &str = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First requirement
    status: draft
    description: >
      Describe what the system shall do.
    tags: [core]
    fields:
      priority: must
      category: functional

  - id: FEAT-001
    type: feature
    title: Initial feature
    status: draft
    description: >
      A user-visible capability delivered by the project.
    fields:
      phase: phase-1
    links:
      - type: satisfies
        target: REQ-001
";

const ASPICE_SAMPLE: &str = "\
artifacts:
  - id: STKHR-001
    type: stakeholder-req
    title: Operators need full sensor history for fleet diagnostics
    status: draft
    description: >
      Fleet operators need access to a complete time-series record of
      every sensor reading so anomalies discovered post-trip can be
      diagnosed against ground-truth data.
    fields:
      priority: must
      source: fleet-operations-stakeholder-doc-v1

  - id: SYSREQ-001
    type: system-req
    title: System shall provide data logging
    status: draft
    description: >
      The system shall log all sensor data at 100Hz to non-volatile storage.
    fields:
      req-type: functional
      priority: must
      verification-criteria: >
        Verify that sensor data is recorded at 100Hz under nominal load.
    links:
      - type: derives-from
        target: STKHR-001

  - id: SWREQ-001
    type: sw-req
    title: Logging service shall buffer sensor frames
    status: draft
    description: >
      The logging service shall maintain a ring buffer of at least 1000
      sensor frames to absorb transient write latency.
    fields:
      req-type: functional
      priority: must
    links:
      - type: derives-from
        target: SYSREQ-001

  - id: SWARCH-001
    type: sw-arch-component
    title: SensorLogger component
    status: draft
    description: >
      Software component responsible for buffering and persisting sensor
      data frames.
    links:
      - type: allocated-from
        target: SWREQ-001
";

const STPA_SAMPLE: &str = "\
artifacts:
  - id: L-001
    type: loss
    title: Loss of vehicle control
    status: draft
    description: >
      Driver loses ability to control vehicle trajectory, potentially
      resulting in collision or road departure.
    fields:
      stakeholders: [driver, passengers, other-road-users]

  - id: H-001
    type: hazard
    title: Unintended acceleration while stationary
    status: draft
    description: >
      Vehicle accelerates without driver command while the vehicle is
      stationary, together with traffic conditions, leading to L-001.
    fields:
      severity: catastrophic
    links:
      - type: leads-to-loss
        target: L-001

  - id: UCA-001
    type: uca
    title: Throttle controller provides torque request when vehicle is stationary and driver has not pressed accelerator
    status: draft
    description: >
      Providing a torque request while stationary and no pedal input
      causes unintended acceleration (H-001).
    fields:
      uca-type: providing
      context: >
        Vehicle is stationary, brake applied, accelerator pedal not pressed.
    links:
      - type: issued-by
        target: CTRL-001
      - type: leads-to-hazard
        target: H-001

  - id: CTRL-001
    type: controller
    title: Throttle controller
    status: draft
    description: >
      ECU responsible for computing torque requests from pedal position
      and engine state.
    fields:
      controller-type: automated
";

const CYBERSECURITY_SAMPLE: &str = "\
artifacts:
  - id: TS-001
    type: threat-scenario
    title: Spoofed CAN messages inject false sensor readings
    status: draft
    description: >
      An attacker with physical access to the OBD-II port sends
      crafted CAN frames that spoof wheel-speed sensor values.
    fields:
      attack-vector: physical
      attack-feasibility: medium
      impact: severe
    links:
      - type: threatens
        target: ASSET-001

  - id: ASSET-001
    type: asset
    title: Wheel-speed sensor data
    status: draft
    description: >
      CAN bus messages carrying wheel-speed sensor readings used
      by ABS and ESC controllers.
    fields:
      asset-type: data
      cybersecurity-properties: [integrity, availability]

  - id: SECGOAL-001
    type: cybersecurity-goal
    title: Ensure integrity of wheel-speed data on CAN bus
    status: draft
    description: >
      Wheel-speed sensor messages shall be authenticated to prevent
      injection of spoofed values.
    fields:
      cal: \"3\"
    links:
      - type: mitigates
        target: TS-001
";

const AADL_SAMPLE: &str = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Sensor data acquisition
    status: draft
    description: >
      The system shall acquire sensor data at a minimum rate of 100Hz.
    fields:
      priority: must
      category: functional

  - id: AADL-001
    type: aadl-component
    title: sensor_acquisition.impl
    status: draft
    description: >
      AADL process implementation for sensor data acquisition,
      containing periodic threads for each sensor channel.
    fields:
      category: process
      aadl-package: sensor_subsystem
      classifier-kind: implementation
    links:
      - type: allocated-from
        target: REQ-001
";

const EU_AI_ACT_SAMPLE: &str = "\
artifacts:
  - id: AI-SYS-001
    type: ai-system-description
    title: AI-Powered Decision Support System
    status: draft
    description: >
      High-risk AI system providing automated recommendations
      for resource allocation in critical infrastructure.
    fields:
      intended-purpose: >
        Real-time analysis of infrastructure telemetry to recommend
        maintenance schedules and resource allocation priorities.
      provider: Example Corp
      risk-class: high-risk

  - id: DS-001
    type: design-specification
    title: Core prediction model design
    status: draft
    description: >
      Gradient-boosted decision tree ensemble for predictive maintenance.
    fields:
      algorithms: >
        XGBoost ensemble with 500 estimators, max depth 8.
        Features: sensor readings, maintenance history, environmental data.
      design-choices: >
        Tree-based model chosen over neural network for interpretability
        and compliance with Art. 13 transparency requirements.
    links:
      - type: satisfies
        target: AI-SYS-001

  - id: DGR-001
    type: data-governance-record
    title: Training data governance
    status: draft
    fields:
      data-sources: >
        3 years of operational telemetry from 200 installations.
        Anonymized maintenance logs from partner organizations.
      collection-method: Automated SCADA export + manual maintenance log entry
      bias-assessment: >
        Geographic bias identified: 80% of data from Northern Europe.
        Mitigation: stratified sampling + synthetic augmentation for
        underrepresented regions.
    links:
      - type: governs
        target: DS-001

  - id: RMP-001
    type: risk-management-process
    title: Continuous risk management
    status: draft
    fields:
      scope: >
        All risks related to the AI system's predictions affecting
        critical infrastructure maintenance decisions.
      methodology: >
        Iterative risk identification using FMEA + STPA hybrid approach.
        Quarterly review cycle with incident-driven ad-hoc reviews.
    links:
      - type: manages-risk-for
        target: AI-SYS-001

  - id: RA-001
    type: risk-assessment
    title: Incorrect maintenance deferral recommendation
    status: draft
    fields:
      risk-description: >
        System recommends deferring maintenance on critical component
        that subsequently fails, causing infrastructure outage.
      likelihood: possible
      severity: major
      risk-level: high
      affected-rights: >
        Right to safety (Art. 6 EU Charter).
        Potential impact on public infrastructure availability.
    links:
      - type: leads-to
        target: AI-SYS-001

  - id: RM-001
    type: risk-mitigation
    title: Confidence threshold with mandatory human review
    status: draft
    fields:
      measure-description: >
        Recommendations below 85% confidence require mandatory human
        engineer review before execution. All critical component
        deferrals require dual sign-off regardless of confidence.
      residual-risk: >
        Human reviewer may rubber-stamp recommendation under time
        pressure. Mitigated by mandatory cooling-off period.
    links:
      - type: mitigates
        target: RA-001

  - id: MON-001
    type: monitoring-measure
    title: Real-time prediction drift monitoring
    status: draft
    fields:
      mechanism-type: drift-detection
      logging-scope: >
        All predictions logged with input features, confidence score,
        and actual outcome (when known). PSI drift score computed daily.
      alert-conditions: >
        Alert when PSI > 0.2 on any feature group or when prediction
        accuracy drops below 90% over rolling 30-day window.
    links:
      - type: monitors
        target: AI-SYS-001

  - id: HO-001
    type: human-oversight-measure
    title: Operator dashboard with override capability
    status: draft
    fields:
      oversight-type: intervention
      capability-description: >
        Operators can view all pending recommendations, inspect the
        reasoning (feature importance), and override or defer any
        recommendation. Emergency shutdown available via dashboard.
    links:
      - type: overseen-by
        target: AI-SYS-001

  - id: TRANS-001
    type: transparency-record
    title: Deployer information package
    status: draft
    fields:
      information-scope: >
        Model card, training data summary, known limitations,
        performance metrics by population subgroup.
      limitations-disclosed: >
        Model trained primarily on Northern European data.
        Performance may degrade for tropical climate installations.
        Not validated for installations older than 20 years.
    links:
      - type: transparency-for
        target: AI-SYS-001
";

const SAFETY_CASE_SAMPLE: &str = "\
artifacts:
  - id: G-001
    type: safety-goal
    title: System is acceptably safe for intended operation
    status: draft
    description: >
      Top-level safety claim for the system under analysis.
    fields:
      claim: >
        The system is acceptably safe for its intended operation,
        considering all identified hazards and operational conditions.
      goal-type: system-level

  - id: C-001
    type: safety-context
    title: Operating environment definition
    status: draft
    fields:
      context-type: scope
      statement: >
        The system operates within its defined operational design domain.
        All identified hazards have been analysed using systematic methods.
    links:
      - type: scopes
        target: G-001

  - id: S-001
    type: safety-strategy
    title: Argue over identified hazards
    status: draft
    fields:
      rationale: >
        Decompose the top-level safety goal by arguing that each
        identified hazard is adequately mitigated through design
        measures and verified by evidence.
      method: decomposition
    links:
      - type: decomposes
        target: G-001

  - id: G-002
    type: safety-goal
    title: Hazard H-001 is adequately mitigated
    status: draft
    fields:
      claim: >
        The identified hazard is mitigated to an acceptable level
        through design measures and operational constraints.
      goal-type: derived
    links:
      - type: sub-goal-of
        target: G-001

  - id: Sn-001
    type: safety-solution
    title: Verification test report for hazard mitigation
    status: draft
    fields:
      evidence-type: test-report
      evidence-ref: TR-001
      confidence: high
    links:
      - type: supports
        target: G-002
";

const STPA_AI_SAMPLE: &str = "\
artifacts:
  - id: L-001
    type: loss
    title: Loss of pedestrian safety
    status: draft
    description: >
      Pedestrian is struck by autonomous vehicle due to perception
      or decision failure, resulting in injury or death.
    fields:
      stakeholders: [pedestrians, vehicle-occupants, operator]

  - id: H-001
    type: hazard
    title: Vehicle fails to stop for pedestrian in crosswalk
    status: draft
    description: >
      Vehicle does not decelerate when a pedestrian is present in
      the planned trajectory, leading to L-001.
    fields:
      severity: catastrophic
    links:
      - type: leads-to-loss
        target: L-001

  - id: CTRL-001
    type: controller
    title: Perception and braking controller
    status: draft
    description: >
      Automated controller responsible for detecting obstacles and
      issuing brake commands.
    fields:
      controller-type: automated

  - id: ML-CTRL-001
    type: ml-controller
    title: Pedestrian detection CNN
    status: draft
    description: >
      Convolutional neural network that detects pedestrians in camera
      frames and outputs bounding boxes with confidence scores.
    fields:
      model-type: cnn
      training-framework: PyTorch
      inference-latency-ms: 35
    links:
      - type: refines
        target: CTRL-001

  - id: TDS-001
    type: training-data-source
    title: Pedestrian detection training dataset
    status: draft
    description: >
      Combined dataset of urban driving scenes with annotated
      pedestrian bounding boxes.
    fields:
      data-sources: >
        NuScenes (40k frames), internal fleet recordings (120k frames),
        synthetic scenes from CARLA simulator (80k frames).
      collection-method: >
        Fleet vehicles equipped with front-facing cameras. Frames
        sampled at 2 Hz during urban driving. Synthetic data generated
        with randomized pedestrian models and lighting.
      labeling-method: Semi-automated with human QA review
      size: 240k annotated frames
      bias-assessment: >
        Under-representation of wheelchair users and children under 5.
        Night-time scenes are 15% of dataset vs 30% of operating hours.
        Mitigation: targeted collection campaign planned for Q3.
      distribution-characteristics: >
        70% daytime, 15% dusk/dawn, 15% night. Urban environments only.
    links:
      - type: trains
        target: ML-CTRL-001

  - id: DH-001
    type: data-hazard
    title: Insufficient night-time pedestrian coverage
    status: draft
    description: >
      Training data under-represents night-time conditions, risking
      degraded detection performance in low-light scenarios.
    fields:
      hazard-category: insufficient-coverage
      affected-population: Pedestrians in low-light conditions
    links:
      - type: leads-to-hazard
        target: H-001

  - id: UCA-001
    type: uca
    title: Controller does not issue brake when pedestrian detected
    status: draft
    description: >
      Not providing a brake command when a pedestrian is detected
      in the vehicle path leads to H-001.
    fields:
      uca-type: not-providing
      context: >
        Pedestrian is in crosswalk, vehicle approaching at city speed.
    links:
      - type: issued-by
        target: CTRL-001
      - type: leads-to-hazard
        target: H-001

  - id: ML-UCA-001
    type: ml-uca
    title: CNN misclassifies pedestrian as background at night
    status: draft
    description: >
      The pedestrian detection model fails to detect a pedestrian
      in low-light conditions due to distribution gap in training data.
    fields:
      ml-failure-mode: misclassification
      operational-design-domain: >
        Urban roads, speed below 50 km/h, ambient light above 1 lux.
    links:
      - type: refines
        target: UCA-001

  - id: MON-001
    type: monitoring-trigger
    title: Detection accuracy drop monitor
    status: draft
    description: >
      Monitors real-time pedestrian detection accuracy against
      ground-truth from shadow-mode lidar cross-check.
    fields:
      metric-name: pedestrian-recall
      threshold: accuracy below 0.95 over rolling 7-day window
      detection-method: >
        Lidar-based shadow detector provides ground-truth labels;
        camera detections compared daily.
    links:
      - type: monitors
        target: ML-CTRL-001

  - id: RTR-001
    type: retraining-requirement
    title: Retrain on low-light failures
    status: draft
    description: >
      When night-time recall drops below threshold, retrain with
      augmented low-light dataset.
    fields:
      trigger-condition: >
        Pedestrian recall at night (ambient light < 10 lux) falls
        below 0.93 for 3 consecutive days.
      validation-criteria: >
        Retrained model must achieve >= 0.96 recall on night-time
        holdout set and not regress on daytime recall (>= 0.98).
      data-requirements: >
        Minimum 20k additional night-time frames with pedestrian
        annotations from diverse urban environments.
    links:
      - type: satisfies
        target: MON-001
";

const DO_178C_SAMPLE: &str = "\
artifacts:
  - id: PSAC-001
    type: plan-for-sw-aspects
    title: Plan for Software Aspects of Certification
    status: draft
    description: >
      PSAC for the flight management software, DAL B.
    fields:
      dal: B

  - id: HLR-001
    type: hw-sw-req
    title: System shall compute flight path within 100ms
    status: draft
    description: >
      The flight management software shall compute an updated
      flight path within 100ms of receiving new navigation data.
    fields:
      dal: B
      derived: false

  - id: LLR-001
    type: lw-sw-req
    title: Path solver shall use WGS-84 geodetic model
    status: draft
    description: >
      The path computation module shall use the WGS-84 geodetic
      model for all coordinate transformations.
    fields:
      dal: B

  - id: DES-001
    type: sw-design
    title: Path computation module design
    status: draft
    description: >
      Architectural design of the path computation module,
      including data flow and timing constraints.
    links:
      - type: satisfies
        target: HLR-001

  - id: TC-001
    type: hw-sw-test-case
    title: Verify flight path computation timing
    status: draft
    description: >
      Test that flight path is computed within 100ms under
      maximum navigation data rate.
    links:
      - type: verifies
        target: HLR-001
";

const EN_50128_SAMPLE: &str = "\
artifacts:
  - id: SIL-001
    type: sw-safety-integrity-req
    title: Interlocking software SIL 4
    status: draft
    description: >
      The interlocking control software shall be developed to SIL 4
      as determined by the system hazard analysis.
    fields:
      sil: SIL-4

  - id: SWREQ-001
    type: sw-req-spec
    title: Route locking shall prevent conflicting movements
    status: draft
    description: >
      The software shall ensure that no two conflicting train
      movements can be simultaneously authorised on overlapping
      track sections.
    links:
      - type: derives-from
        target: SIL-001

  - id: ARCH-001
    type: sw-arch-spec
    title: Interlocking software architecture
    status: draft
    description: >
      Diverse redundant architecture with two independent
      processing channels and a comparator.
    fields:
      architecture-technique: diverse-redundancy

  - id: COMP-001
    type: sw-component
    title: Route conflict checker module
    status: draft
    description: >
      Module implementing route conflict detection logic for
      the primary processing channel.
    links:
      - type: implements
        target: DSGN-001

  - id: DSGN-001
    type: sw-design-spec
    title: Route conflict checker design
    status: draft
    description: >
      Detailed design of the route conflict detection algorithm.

  - id: MT-001
    type: sw-module-test
    title: Route conflict checker module test
    status: draft
    description: >
      Unit tests verifying the route conflict checker against
      all defined conflict scenarios.
    links:
      - type: verifies
        target: COMP-001
";

const IEC_61508_SAMPLE: &str = "\
artifacts:
  - id: SC-001
    type: safety-concept
    title: Emergency shutdown safety concept
    status: draft
    description: >
      Overall safety strategy for the emergency shutdown system
      targeting SIL 3 integrity.
    fields:
      sil-target: SIL-3
      scope: >
        Covers all safety functions related to emergency shutdown
        of the reactor coolant system.

  - id: SR-001
    type: safety-req
    title: Emergency shutdown shall activate within 500ms
    status: draft
    description: >
      The safety-related system shall initiate emergency shutdown
      within 500ms of detecting an over-pressure condition.
    fields:
      sil: SIL-3
      req-type: functional
      allocation: ESD-Controller
    links:
      - type: derives-from
        target: SC-001

  - id: SF-001
    type: safety-function
    title: Over-pressure emergency shutdown
    status: draft
    description: >
      Detects pressure exceeding 150 bar and actuates shutdown valves
      to bring the system to a safe state.
    fields:
      sil: SIL-3
      response-time: 500ms
      diagnostic-coverage: high
";

const IEC_62304_SAMPLE: &str = "\
artifacts:
  - id: SDP-001
    type: sw-dev-plan
    title: Infusion pump software development plan
    status: draft
    description: >
      Software development plan for the infusion pump control software,
      classified as Class C per IEC 62304.

  - id: SWREQ-001
    type: sw-req
    title: Flow rate accuracy within 5%
    status: draft
    description: >
      The infusion pump software shall control the flow rate to within
      +/- 5% of the set rate under all operating conditions.
    fields:
      sw-class: C
      risk-control: Prevents over-infusion hazard
    links:
      - type: derives-from
        target: SDP-001

  - id: ARCH-001
    type: sw-arch-item
    title: Flow control module
    status: draft
    description: >
      Software module responsible for closed-loop flow rate control,
      fully segregated from non-safety user interface code.
    fields:
      segregation-level: full
";

const ISO_PAS_8800_SAMPLE: &str = "\
artifacts:
  - id: AIE-001
    type: ai-element
    title: Pedestrian detection model
    status: draft
    description: >
      Deep learning model for detecting pedestrians from camera images,
      used as the primary perception element for emergency braking.
    fields:
      ai-type: perception
      safety-relevance: ASIL-D

  - id: AISR-001
    type: ai-safety-req
    title: Pedestrian detection recall requirement
    status: draft
    description: >
      The pedestrian detection model shall achieve a minimum recall of
      99.5% on the operational design domain test dataset.
    fields:
      performance-criterion: >
        Recall (true positive rate) for pedestrian detection across all
        lighting and weather conditions in the operational design domain.
      acceptance-threshold: '>= 0.995'
    links:
      - type: derives-from
        target: AIE-001

  - id: AIAM-001
    type: ai-arch-measure
    title: Lidar-camera redundancy for pedestrian detection
    status: draft
    description: >
      Redundant perception channel using lidar point cloud processing
      to cross-validate camera-based pedestrian detections.
    fields:
      measure-type: redundancy
    links:
      - type: satisfies
        target: AISR-001

  - id: AIDM-001
    type: ai-dev-measure
    title: Formal code review for inference pipeline
    status: draft
    description: >
      All code in the inference pipeline undergoes formal review with
      two independent reviewers per change, following MISRA-C guidelines.
    links:
      - type: satisfies
        target: AISR-001

  - id: AIDR-001
    type: ai-data-req
    title: Training data diversity requirement
    status: draft
    description: >
      Training data must include representative samples from all
      operational design domain conditions.
    fields:
      data-quality-metric: ODD coverage completeness
      min-threshold: '>= 95% of defined ODD conditions represented'
    links:
      - type: governs
        target: AIE-001

  - id: AITR-001
    type: ai-training-record
    title: Pedestrian detector v2.3 training run
    status: draft
    description: >
      Training run for pedestrian detection model version 2.3.
    fields:
      dataset-version: PedDataset-v4.1
      hyperparameters: >
        Learning rate: 1e-4, batch size: 64, epochs: 120,
        optimizer: AdamW, weight decay: 0.01.
      metric-results: >
        Recall: 0.997, precision: 0.993, F1: 0.995,
        mAP@0.5: 0.991, inference latency: 28ms.
    links:
      - type: trains
        target: AIE-001

  - id: AIVERIF-001
    type: ai-verification
    title: Pedestrian detector test suite verification
    status: draft
    description: >
      Verification of the pedestrian detection model against the
      safety requirement using the ODD holdout test set.
    links:
      - type: verifies
        target: AIE-001

  - id: AIVAL-001
    type: ai-validation
    title: Operational validation on test track
    status: draft
    description: >
      Validation of the pedestrian detection system in real-world
      test track scenarios covering all ODD conditions.
    links:
      - type: validates
        target: AIE-001

  - id: AIDEP-001
    type: ai-deployment
    title: ECU deployment configuration for v2.3
    status: draft
    description: >
      Deployment configuration for pedestrian detector v2.3 on the
      target ADAS ECU with TensorRT optimization.
    links:
      - type: deploys
        target: AIE-001

  - id: AIMON-001
    type: ai-monitoring
    title: Runtime detection confidence monitor
    status: draft
    description: >
      Monitors average detection confidence scores and flags anomalies
      indicating potential model degradation in the field.
    links:
      - type: monitors
        target: AIE-001

  - id: AITQ-001
    type: ai-tool-qual
    title: Training framework qualification
    status: draft
    description: >
      Qualification of the PyTorch training framework and custom
      data augmentation pipeline used for model development.
    fields:
      tool-class: TQL-2

  - id: AIAA-001
    type: ai-assurance-argument
    title: Pedestrian detection safety argument
    status: draft
    description: >
      Top-level assurance argument that the pedestrian detection AI
      element meets all safety requirements throughout its lifecycle.
    links:
      - type: argues
        target: AIE-001
";

const SOTIF_SAMPLE: &str = "\
artifacts:
  - id: SH-001
    type: sotif-hazard
    title: Phantom braking from sensor noise
    status: draft
    description: >
      The vehicle performs unnecessary emergency braking due to radar
      ghost targets caused by multi-path reflections from guardrails
      or overhead structures.
    fields:
      insufficiency-type: sensor-limitation

  - id: SH-002
    type: sotif-hazard
    title: Missed pedestrian in cluttered scene
    status: draft
    description: >
      The perception system fails to detect a pedestrian when the
      background is visually complex (e.g. crowded storefronts,
      construction zones), leading to late or absent braking.
    fields:
      insufficiency-type: algorithm-limitation

  - id: STC-001
    type: sotif-triggering-condition
    title: Guardrail multi-path radar reflection
    status: draft
    description: >
      Driving alongside metal guardrails in curves where multi-path
      radar reflections create persistent ghost targets at short range.
    fields:
      environment: >
        Highway curve with metal guardrails, speed 80-120 km/h,
        any weather condition.
      probability: Moderate (estimated 1 in 500 guardrail passages)
    links:
      - type: triggers
        target: SH-001

  - id: STC-002
    type: sotif-triggering-condition
    title: Visually cluttered urban intersection
    status: draft
    description: >
      Urban intersection with overlapping pedestrians, signage, and
      construction equipment that degrades detection confidence.
    fields:
      environment: >
        Urban intersection, daytime, cluttered background with
        construction equipment and dense signage.
      probability: Low (estimated 1 in 2000 urban intersections)
    links:
      - type: triggers
        target: SH-002

  - id: SSCEN-001
    type: sotif-scenario
    title: Curved guardrail ghost target scenario
    status: draft
    description: >
      Test scenario: vehicle travels at 100 km/h through a left-hand
      highway curve with continuous metal guardrail on the right side,
      verifying that no false braking occurs.
    fields:
      scenario-type: known-unsafe
    links:
      - type: exercises
        target: STC-001

  - id: SSCEN-002
    type: sotif-scenario
    title: Cluttered intersection pedestrian detection
    status: draft
    description: >
      Test scenario: pedestrian crosses at an intersection with
      construction scaffolding and dense signage in the background,
      verifying timely detection and braking.
    fields:
      scenario-type: known-unsafe
    links:
      - type: exercises
        target: STC-002

  - id: SAC-001
    type: sotif-acceptance-criterion
    title: False positive braking rate
    status: draft
    description: >
      Acceptance criterion for the maximum allowable rate of false
      positive emergency braking events per million kilometers.
    fields:
      metric: false-positive emergency braking events per million km
      target-value: '< 0.1'

  - id: SVERIF-001
    type: sotif-verification
    title: Radar ghost target analysis
    status: draft
    description: >
      Verification that radar processing algorithms correctly filter
      multi-path reflections in all tested guardrail geometries.
    links:
      - type: verifies
        target: SH-001

  - id: SVERIF-002
    type: sotif-verification
    title: Cluttered scene detection verification
    status: draft
    description: >
      Verification that the perception pipeline maintains required
      detection recall in visually cluttered environments.
    links:
      - type: verifies
        target: SH-002

  - id: SVAL-001
    type: sotif-validation
    title: Field driving residual risk validation
    status: draft
    description: >
      Validation over 10 million km of field driving data confirming
      that false positive braking rate meets the acceptance criterion.
    links:
      - type: validates
        target: SAC-001

  - id: SKU-001
    type: sotif-known-unsafe
    title: Guardrail ghost target mitigation
    status: draft
    description: >
      Mitigation strategy: radar signal processing with guardrail
      geometry model to suppress multi-path ghost targets.
    links:
      - type: mitigates
        target: SH-001

  - id: SUU-001
    type: sotif-unknown-unsafe
    title: Adversarial scene exploration
    status: draft
    description: >
      Strategy for discovering unknown unsafe scenarios using
      adversarial perturbation of sensor inputs in simulation.
    fields:
      exploration-method: adversarial-testing
";

/// Initialize a new rivet project.
pub(crate) fn cmd_init(
    name: Option<&str>,
    preset: &str,
    schema_override: &[String],
    dir: &std::path::Path,
    vendor_schemas: bool,
) -> Result<bool> {
    let dir = if dir == std::path::Path::new(".") {
        std::env::current_dir().context("resolving current directory")?
    } else {
        dir.to_path_buf()
    };

    let project_name = name.map(|s| s.to_string()).unwrap_or_else(|| {
        dir.file_name()
            .map(|n| n.to_string_lossy().into_owned())
            .unwrap_or_else(|| "my-project".to_string())
    });

    // Check for existing rivet.yaml
    let config_path = dir.join("rivet.yaml");
    if config_path.exists() {
        eprintln!(
            "warning: {} already exists, skipping init",
            config_path.display()
        );
        return Ok(false);
    }

    // Resolve preset (before I/O so invalid preset fails early)
    let init_preset = resolve_preset(preset)?;

    // Ensure the target directory exists
    std::fs::create_dir_all(&dir)
        .with_context(|| format!("creating directory {}", dir.display()))?;

    // Use --schema override if provided, otherwise use preset defaults
    let schemas: Vec<String> = if schema_override.is_empty() {
        init_preset.schemas.iter().map(|s| s.to_string()).collect()
    } else {
        schema_override.to_vec()
    };

    // Build schema list for the config
    let schema_entries: String = schemas
        .iter()
        .map(|s| format!("    - {s}"))
        .collect::<Vec<_>>()
        .join("\n");

    // Write rivet.yaml
    let config_content = format!(
        "\
project:
  name: {project_name}
  version: \"0.1.0\"
  schemas:
{schema_entries}

sources:
  - path: artifacts
    format: generic-yaml
"
    );
    std::fs::write(&config_path, &config_content)
        .with_context(|| format!("writing {}", config_path.display()))?;
    println!("  created {}", config_path.display());

    // Report auto-discovered bridge schemas
    let bridges = rivet_core::embedded::discover_bridges(&schemas);
    if !bridges.is_empty() {
        println!("\n  bridge schemas (auto-loaded at runtime):");
        for bridge in &bridges {
            println!("    + {bridge}");
        }
    }

    // REQ-356: and the ones that are one base away. A bridge fires only when
    // ALL its bases are loaded, so the schema set is a rigour selector — this
    // makes the tiers a project is NOT carrying visible at the moment the
    // choice is made, rather than leaving their absence to be inferred.
    // Informational by design: it is never an error to decline a tier, only to
    // declare one and not satisfy it.
    // REQ-359: bridge files present on disk that nobody declared. Auto-discovery
    // is built-ins only, so these are invisible until named — this makes them
    // visible WITHOUT making them implicit. Activation stays an explicit
    // `schemas:` entry, which REQ-356 then checks.
    let local = rivet_core::embedded::undeclared_local_bridges(&schemas, &dir.join("schemas"));
    if !local.is_empty() {
        println!("\n  local bridges found on disk but NOT declared:");
        for (stem, missing) in &local {
            if missing.is_empty() {
                println!("    - {stem}  (bases satisfied — add `- {stem}` to `schemas:` to load)");
            } else {
                println!("    - {stem}  needs: {}", missing.join(", "));
            }
        }
        println!("    a dropped-in bridge is never auto-discovered; only built-ins are.");
    }

    let dormant = rivet_core::embedded::dormant_bridges(&schemas);
    if !dormant.is_empty() {
        println!("\n  dormant bridges (one or more bases away — not active here):");
        for (bridge, missing) in &dormant {
            println!("    - {bridge}  needs: {}", missing.join(", "));
        }
        println!(
            "    add the missing schema(s) to activate, or name the bridge in \
             `schemas:` to make the dependency explicit and checked."
        );
    }

    // #431: vendor the resolved schema set (plus bridges) on-disk so validation
    // is pinned against rivet upgrades. The loader prefers `schemas/<name>.yaml`
    // over the embedded copy. REQ-401 item 4: that pins what is vendored, not
    // everything. A bridge that auto-discovery finds and that is not on disk
    // (one a later release adds) still loads from the binary. Existing files
    // are left untouched (never clobber a locally-edited schema).
    if vendor_schemas {
        let schemas_dir = dir.join("schemas");
        std::fs::create_dir_all(&schemas_dir)
            .with_context(|| format!("creating {}", schemas_dir.display()))?;
        println!("\n  vendoring schemas (pinned against upgrades):");
        let mut wrote = 0usize;
        for name in rivet_core::embedded::schema_names_with_bridges(&schemas) {
            let content = rivet_core::embedded::embedded_schema(&name)
                .or_else(|| rivet_core::embedded::embedded_bridge(&name));
            let Some(content) = content else {
                eprintln!("    ! {name}: no embedded schema to vendor — skipping");
                continue;
            };
            let path = schemas_dir.join(format!("{name}.yaml"));
            if path.exists() {
                println!("    = {} (exists, kept)", path.display());
                continue;
            }
            std::fs::write(&path, content)
                .with_context(|| format!("writing {}", path.display()))?;
            println!("    + {}", path.display());
            wrote += 1;
        }
        println!(
            "  vendored {wrote} schema file(s) into {}",
            schemas_dir.display()
        );
    }

    // Create artifacts/ directory with preset-specific sample files
    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir)
        .with_context(|| format!("creating {}", artifacts_dir.display()))?;

    for (filename, content) in &init_preset.sample_files {
        let path = artifacts_dir.join(filename);
        std::fs::write(&path, content).with_context(|| format!("writing {}", path.display()))?;
        println!("  created {}", path.display());
    }

    // Create docs/ directory with a sample document
    let docs_dir = dir.join("docs");
    std::fs::create_dir_all(&docs_dir)
        .with_context(|| format!("creating {}", docs_dir.display()))?;

    let sample_doc_path = docs_dir.join("getting-started.md");
    let sample_doc = format!(
        "\
# {project_name}

Getting started with your rivet project.

## Overview

This project uses [rivet](https://github.com/pulseengine/rivet) for SDLC artifact
traceability and validation. Artifacts are stored as YAML files in `artifacts/` and
validated against schemas listed in `rivet.yaml`.

## Quick start

```bash
rivet validate     # Validate all artifacts
rivet list         # List all artifacts
rivet stats        # Show summary statistics
```
"
    );
    std::fs::write(&sample_doc_path, &sample_doc)
        .with_context(|| format!("writing {}", sample_doc_path.display()))?;
    println!("  created {}", sample_doc_path.display());

    println!(
        "\nInitialized rivet project '{}' in {} (preset: {preset})",
        project_name,
        dir.display()
    );

    Ok(true)
}

/// Install git hooks that delegate to rivet for commit validation.
///
/// Hooks chain with existing hooks: if a hook file already exists, it is
/// renamed to `<hook>.prev` and called after rivet's check succeeds.
/// This allows coexistence with other hook managers (husky, pre-commit, lefthook).
/// Scaffold the `.rivet/` workspace tree. Creates directory structure +
/// pin file + project-owned placeholder files. Templates are NOT copied
/// here — that's `rivet templates copy-to-project`'s job. This runs only
/// when the user passes `--bootstrap` and always after `cmd_init_agents`.
///
/// Ownership contract: every file written here is PROJECT-OWNED once
/// created; `rivet init --agents --bootstrap` refuses to overwrite any
/// project-owned file that already exists. Use `rivet upgrade
/// --resync-project` if you really want to regenerate them.
pub(crate) fn cmd_init_bootstrap(cli: &Cli) -> Result<bool> {
    use rivet_core::ownership::{WriteMode, guard_write, rivet_dir};
    use rivet_core::rivet_version::{FileRecord, RivetVersion, ScaffoldedFrom, content_sha256};

    let project_root = cli.project.clone();
    let rivet_dir = rivet_dir(&project_root);

    // 1. Top-level `.rivet/` directory + subdirs.
    for sub in [
        ".rivet",
        ".rivet/pipelines",
        ".rivet/context",
        ".rivet/agents",
        ".rivet/runs",
    ] {
        let p = project_root.join(sub);
        if !p.exists() {
            std::fs::create_dir_all(&p).with_context(|| format!("creating {}", p.display()))?;
        }
    }

    // 2. Project-owned placeholder files. Each goes through the ownership
    //    guard so re-running this command on an existing scaffold refuses
    //    to clobber user content.
    let mut file_records: Vec<FileRecord> = Vec::new();

    // 2a. Context placeholders
    let context_files: &[(&str, &str)] = &[
        (".rivet/context/review-roles.yaml", REVIEW_ROLES_STARTER),
        (".rivet/context/risk-tolerance.yaml", RISK_TOLERANCE_STARTER),
        (".rivet/context/domain-glossary.md", DOMAIN_GLOSSARY_STARTER),
    ];
    for (rel, content) in context_files {
        let abs = project_root.join(rel);
        let exists = abs.exists();
        match guard_write(&rivet_dir, &abs, WriteMode::Scaffold, exists) {
            Ok(()) => {
                std::fs::write(&abs, content)
                    .with_context(|| format!("writing {}", abs.display()))?;
                file_records.push(FileRecord {
                    path: rel.to_string(),
                    from_template: format!("builtin:{}", rel.rsplit_once('/').unwrap().1),
                    scaffolded_sha: content_sha256(content.as_bytes()),
                });
                eprintln!("  scaffolded {}", rel);
            }
            Err(e) if format!("{e}").contains("refusing to overwrite") => {
                eprintln!("  kept {} (already project-owned)", rel);
            }
            Err(e) => return Err(anyhow::anyhow!("{e}")),
        }
    }

    // 2b. Agent-facing project rule. Pulls in what `cmd_init_agents`
    //     already wrote into AGENTS.md so the agent has a single canonical
    //     file to read.
    let rule_path = project_root.join(".rivet/agents/rivet-rule.md");
    let rule_exists = rule_path.exists();
    match guard_write(&rivet_dir, &rule_path, WriteMode::Scaffold, rule_exists) {
        Ok(()) => {
            let content = rivet_rule_starter(cli);
            std::fs::write(&rule_path, &content)
                .with_context(|| format!("writing {}", rule_path.display()))?;
            file_records.push(FileRecord {
                path: ".rivet/agents/rivet-rule.md".into(),
                from_template: "builtin:rivet-rule.md".into(),
                scaffolded_sha: content_sha256(content.as_bytes()),
            });
            eprintln!("  scaffolded .rivet/agents/rivet-rule.md");
        }
        Err(_) => {
            eprintln!("  kept .rivet/agents/rivet-rule.md (already project-owned)");
        }
    }

    // 3. Pin file — .rivet/.rivet-version. Writes even if present; this
    //    records the scaffold event.
    let version_path = rivet_dir.join(".rivet-version");
    let pin = RivetVersion {
        rivet_cli: env!("CARGO_PKG_VERSION").to_string(),
        template_version: 1,
        scaffolded_at: iso8601_now(),
        files: file_records,
        scaffolded_from: ScaffoldedFrom {
            templates_version: 1,
            schemas: Default::default(),
        },
    };
    let yaml = pin.to_yaml().map_err(|e| anyhow::anyhow!("{e}"))?;
    std::fs::write(&version_path, yaml)
        .with_context(|| format!("writing {}", version_path.display()))?;
    eprintln!(
        "  pinned .rivet/.rivet-version (rivet-cli {})",
        pin.rivet_cli
    );

    // 4. Report next steps so the user knows what's expected.
    println!();
    println!("Bootstrap complete. Next steps before `rivet close-gaps` will run:");
    println!(
        "  1. Edit .rivet/context/review-roles.yaml — replace TODOs with actual reviewer groups"
    );
    println!(
        "  2. Edit .rivet/context/risk-tolerance.yaml — set integrity-level thresholds for your project"
    );
    println!(
        "  3. Optional: `rivet templates copy-to-project <kind>` to customise pipeline prompts"
    );
    println!("  4. Run `rivet pipelines validate` — confirms every Tier-3 placeholder is resolved");
    println!();
    println!("See .rivet/agents/rivet-rule.md for the project-specialised agent instructions.");

    Ok(true)
}

fn iso8601_now() -> String {
    // Kept tiny so we don't pull in chrono; matches runs::new_run_id format.
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;
    let days = secs.div_euclid(86_400);
    let rem = secs.rem_euclid(86_400) as u32;
    let h = rem / 3600;
    let m = (rem / 60) % 60;
    let s = rem % 60;
    let (y, mo, d) = civil_from_days(days);
    format!("{y:04}-{mo:02}-{d:02}T{h:02}:{m:02}:{s:02}Z")
}

fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as u32;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y, m, d)
}

fn rivet_rule_starter(cli: &Cli) -> String {
    // Project-specialised version of the skill rule. Agents read this on
    // trigger; rivet never rewrites it after scaffold, so it's the
    // authoritative project-specific instruction file.
    let project_name = cli
        .project
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("this project");
    format!(
        "# rivet in {project_name}\n\
        \n\
        This file was scaffolded once by `rivet init --agents --bootstrap`.\n\
        Edit freely — rivet never rewrites it. For the generic skill surface\n\
        see `.claude/skills/rivet-rule/SKILL.md` (or the equivalent for your\n\
        agent tool).\n\
        \n\
        ## How this project uses rivet\n\
        \n\
        - Schemas:  see `rivet.yaml :: project.schemas`\n\
        - Variants: see `rivet variant list`\n\
        - Pipelines: run `rivet pipelines list` to see active agent-pipelines\n\
        \n\
        ## The loop\n\
        \n\
        ```bash\n\
        rivet pipelines validate          # hard gate; fix .rivet/context/ until clean\n\
        rivet close-gaps --format json    # ranks gaps, produces proposals\n\
        # for each gap (parallel sub-agents):\n\
        #   execute the template-pair's discover.md in the scratch worktree\n\
        #   fresh-session validate.md runs `rivet validate` cold\n\
        #   emit.md produces the draft PR\n\
        rivet runs record --run-id <id> --outcome outcomes.json\n\
        ```\n\
        \n\
        ## Project conventions to enforce\n\
        \n\
        - Every commit under `artifacts/**/*.yaml` needs a trailer per the\n\
          project's commits.trailers config in rivet.yaml.\n\
        - Never commit without a fresh `rivet validate` in the scratch\n\
          worktree where the change was made.\n\
        - When a gap is `human-review-required`, read `.rivet/context/`\n\
          first — domain glossary + review roles + risk tolerance carry\n\
          project-specific context no prompt should override.\n\
        \n\
        ## Project-specific notes\n\
        \n\
        <!-- Add anything here that makes your project special: domain\n\
             terminology, review customs, release procedures, review groups\n\
             and their GitHub handles. The agent reads this on trigger. -->\n"
    )
}

const REVIEW_ROLES_STARTER: &str = r#"# .rivet/context/review-roles.yaml
#
# Maps reviewer-group names referenced in your schemas' agent-pipelines
# blocks (via `{context.review-roles.X}` placeholders) to concrete
# reviewers in your organisation.
#
# This file is PROJECT-OWNED. Rivet scaffolds it once and never rewrites
# it. Add / remove roles as your pipelines require them.
#
# Each role is a list of identifiers — the shape (GitHub handles, teams,
# emails, Slack group IDs) is a project-level decision. Every downstream
# closure PR will tag the listed reviewers.

dev-team:
  # TODO: replace with actual reviewers for this project.
  # Example formats:
  #   GitHub handles:   ["@alice", "@bob"]
  #   GitHub team ref:  ["@yourorg/dev-leads"]
  #   Email addresses:  ["alice@example.com"]
  - "{{PLACEHOLDER: list at least one reviewer or mark accepted-empty}}"

qa-lead:
  - "{{PLACEHOLDER: required for safety-critical schemas (ASPICE, 26262)}}"

safety-officer:
  - "{{PLACEHOLDER: required for ISO 26262 ASIL decomposition closures}}"
"#;

const RISK_TOLERANCE_STARTER: &str = r#"# .rivet/context/risk-tolerance.yaml
#
# Integrity-level thresholds for coverage/evidence oracles in your
# project. Schemas reference these via `{context.risk-tolerance.X}`.
#
# PROJECT-OWNED. Rivet scaffolds once; edit freely thereafter.

mc-dc-asil-d: 95.0       # ISO 26262-6 Table 12 row MC/DC
mc-dc-asil-c: 85.0
branch-asil-b: 70.0
statement-asil-a: 50.0

# Add / remove keys to match the oracles your schemas actually use.
# If your schemas don't reference coverage thresholds at all, this file
# can stay minimal but should still be present.
"#;

const DOMAIN_GLOSSARY_STARTER: &str = r#"# Domain glossary

<!-- PROJECT-OWNED. Rivet scaffolds once, never rewrites. Fill in the
     terms your project uses — an agent will consult this when drafting
     content for human-review-required gaps so synthesised stubs match
     your organisation's vocabulary. -->

## Core terms

- **requirement** — {{PLACEHOLDER: what "requirement" means in this project — formality, approval workflow, naming}}
- **safety goal** — {{PLACEHOLDER: if relevant; else mark accepted-empty}}
- **mitigation** — {{PLACEHOLDER}}

## Variant vocabulary

- **production build** — {{PLACEHOLDER: which variant name(s) map to production}}
- **developer build** — {{PLACEHOLDER: dev-only variants}}

## Stakeholder shorthands

- **the-team** — {{PLACEHOLDER: e.g. which GH team: @yourorg/sw-team}}
"#;

pub(crate) fn cmd_init_hooks(dir: &std::path::Path) -> Result<bool> {
    let dir = if dir == std::path::Path::new(".") {
        std::env::current_dir().context("resolving current directory")?
    } else {
        dir.to_path_buf()
    };

    // Find .git directory (supports worktrees)
    let git_dir_output = std::process::Command::new("git")
        .args(["rev-parse", "--git-dir"])
        .current_dir(&dir)
        .output()
        .context("running git rev-parse --git-dir")?;

    if !git_dir_output.status.success() {
        anyhow::bail!("not a git repository (run from a git working tree)");
    }

    let git_dir = dir.join(String::from_utf8_lossy(&git_dir_output.stdout).trim());
    let hooks_dir = git_dir.join("hooks");
    std::fs::create_dir_all(&hooks_dir)
        .with_context(|| format!("creating {}", hooks_dir.display()))?;

    // Use PATH-based `rivet` so hooks work for any install method.
    // Falls back to absolute path only if rivet is not in PATH.
    let rivet_bin = which_rivet();

    // ── commit-msg hook ─────────────────────────────────────────────
    let commit_msg_path = hooks_dir.join("commit-msg");
    install_hook(
        &commit_msg_path,
        &format!(
            r#"#!/usr/bin/env bash
# Installed by: rivet init --hooks
# Validates commit trailers reference artifact IDs.
"{rivet_bin}" commit-msg-check "$1" || exit $?
"#,
        ),
    )?;
    println!("  installed {}", commit_msg_path.display());

    // ── pre-commit hook ─────────────────────────────────────────────
    // Marker-discovery walks up from $PWD to find rivet.yaml. This
    // survives relocation of the project within the working tree (a
    // hard-coded `-p <path>` would silently validate the wrong directory
    // or skip validation after a move).
    //
    // Formatting gate (REQ-210, #438): a misformatted-Rust diff is the most
    // common first-push CI failure, and AI agents kept hitting it because the
    // hook only ran `rivet validate`. Run `cargo fmt --all -- --check` BEFORE
    // validate — but only when cargo is on PATH and the commit actually stages
    // a `.rs` file, so the hook stays language-agnostic and never blocks
    // commits in non-Rust rivet projects. Convenience only; CI is the real
    // gate (REQ-051) and `--no-verify` still bypasses this.
    let pre_commit_path = hooks_dir.join("pre-commit");
    install_hook(
        &pre_commit_path,
        &format!(
            r#"#!/usr/bin/env bash
# Installed by: rivet init --hooks
# Runs cargo fmt --check (staged Rust) + rivet validate; blocks on errors.
#
# Marker discovery: walk up from $PWD until we find rivet.yaml, then cd
# into that directory before running rivet. This keeps the hook working
# after the rivet project is moved inside the git tree.
dir="$PWD"
while [ "$dir" != "/" ] && [ ! -f "$dir/rivet.yaml" ]; do
    dir="$(dirname "$dir")"
done
if [ ! -f "$dir/rivet.yaml" ]; then
    # No rivet project in the ancestor chain — skip silently so the hook
    # does not block commits in unrelated repositories.
    exit 0
fi
cd "$dir" || exit 0

# Formatting gate: only when cargo is present AND the commit stages Rust.
# A misformatted diff is the most common first-push CI failure; catching it
# here (~1s) keeps local commits in parity with the CI Format job. Skipped
# silently for non-Rust projects.
if command -v cargo >/dev/null 2>&1 \
    && git diff --cached --name-only --diff-filter=ACM | grep -q '\.rs$'; then
    if ! cargo fmt --all -- --check; then
        echo "cargo fmt: formatting issues. Run 'cargo fmt --all', then re-stage."
        exit 1
    fi
fi

output=$("{rivet_bin}" validate --format json 2>/dev/null)
errors=$(echo "$output" | python3 -c "import json,sys; print(json.load(sys.stdin).get('errors',0))" 2>/dev/null || echo "0")
if [ "$errors" -gt 0 ]; then
    echo "rivet validate: $errors error(s). Run 'rivet validate' for details."
    exit 1
fi
"#,
        ),
    )?;
    println!("  installed {}", pre_commit_path.display());

    println!("\nGit hooks installed. Rivet will validate commits automatically.");
    println!("Hooks chain with existing hooks via .prev files.");
    Ok(true)
}

/// Resolve the rivet binary for hooks: prefer PATH-based "rivet" if available,
/// fall back to the current executable's absolute path.
fn which_rivet() -> String {
    // Check if `rivet` is in PATH by running `which rivet`.
    if let Ok(output) = std::process::Command::new("which").arg("rivet").output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                return path;
            }
        }
    }
    // Fallback: absolute path to current exe.
    std::env::current_exe()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| "rivet".to_string())
}

/// Install a hook file, chaining with any existing hook.
///
/// If a hook already exists:
/// 1. Rename it to `<hook>.prev`
/// 2. The new hook calls `<hook>.prev` at the end (after rivet's check)
///
/// This allows coexistence with pre-commit, husky, lefthook, etc.
fn install_hook(path: &std::path::Path, content: &str) -> Result<()> {
    if path.exists() {
        let prev = path.with_extension("prev");
        // Don't overwrite an existing .prev (user may have modified it)
        if !prev.exists() {
            std::fs::rename(path, &prev)
                .with_context(|| format!("backing up {}", path.display()))?;
            eprintln!("  note: existing hook backed up to {}", prev.display());
        }
    }

    // Check for .prev file and append chaining call
    let prev = path.with_extension("prev");
    let chain_snippet = if prev.exists() {
        format!(
            "\n# Chain to previous hook\nif [ -x \"{}\" ]; then\n    \"{}\" \"$@\"\nfi\n",
            prev.display(),
            prev.display()
        )
    } else {
        String::new()
    };

    let final_content = format!("{content}{chain_snippet}");
    std::fs::write(path, &final_content).with_context(|| format!("writing {}", path.display()))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o755))
            .with_context(|| format!("setting permissions on {}", path.display()))?;
    }
    Ok(())
}

/// Collapse newlines and pipes so a description fits in a markdown table cell.
fn sanitize_for_table(s: &str) -> String {
    s.replace('\n', " ")
        .replace('|', "/")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

/// Generate AGENTS.md (and CLAUDE.md shim) from current project state.
///
/// The generated content is wrapped in `rivet-managed` HTML-comment markers
/// so that manual edits made outside the markers survive regeneration. See
/// [`rivet_core::managed_section`] for the splice semantics.
///
/// Behaviour on an existing file:
/// - Has exactly one marker pair: splice — replace only the managed region.
/// - Has no markers and `migrate` is true: wrap existing content (managed
///   section goes on top, prior content preserved verbatim below).
/// - Has no markers and `force_regen` is true: overwrite the whole file
///   with a freshly markered version (destructive; loud warning printed).
/// - Has no markers and neither flag is set: refuse with exit code 1.
/// - Has multiple marker pairs: refuse with exit code 1 (ambiguous).
pub(crate) fn cmd_init_agents(cli: &Cli, migrate: bool, force_regen: bool) -> Result<bool> {
    let config_path = cli.project.join("rivet.yaml");

    // Try to load project config — it's okay if it doesn't exist
    let has_project = config_path.exists();

    if !has_project {
        anyhow::bail!(
            "No rivet.yaml found in {}. Run `rivet init` first, then `rivet init --agents`.",
            cli.project.display()
        );
    }

    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let schemas_dir = resolve_schemas_dir(cli);
    let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas")?;

    // Load artifacts
    let mut store = Store::new();
    for source in &config.sources {
        match rivet_core::load_artifacts(source, &cli.project, &schema) {
            Ok(artifacts) => {
                for artifact in artifacts {
                    store.upsert(artifact);
                }
            }
            Err(e) => {
                eprintln!("warning: could not load source '{}': {}", source.path, e);
            }
        }
    }

    // Build link graph and validate
    let graph = LinkGraph::build(&store, &schema);
    let diagnostics = validate::validate(&store, &schema, &graph);
    let error_count = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let validation_status = if error_count > 0 {
        format!("{} errors", error_count)
    } else {
        "pass".to_string()
    };

    // Collect artifact types with counts, sorted
    let mut type_counts: Vec<(String, usize)> = store
        .types()
        .map(|t| (t.to_string(), store.count_by_type(t)))
        .collect();
    type_counts.sort_by(|a, b| a.0.cmp(&b.0));

    let total_count = store.len();
    let type_count = type_counts.len();

    // Schema list
    let schema_list = config.project.schemas.join(", ");

    // Source paths
    let source_paths = config
        .sources
        .iter()
        .map(|s| format!("`{}`", s.path))
        .collect::<Vec<_>>()
        .join(", ");

    // Doc paths
    let doc_paths = if config.docs.is_empty() {
        "(none configured)".to_string()
    } else {
        config
            .docs
            .iter()
            .map(|d| format!("`{}`", d.path()))
            .collect::<Vec<_>>()
            .join(", ")
    };

    // Artifact types table
    let mut artifact_types_section = String::new();
    artifact_types_section.push_str("| Type | Count | Description |\n");
    artifact_types_section.push_str("|------|------:|-------------|\n");
    for (type_name, count) in &type_counts {
        let desc = schema
            .artifact_type(type_name)
            .map(|t| sanitize_for_table(&t.description))
            .unwrap_or_default();
        artifact_types_section.push_str(&format!("| `{}` | {} | {} |\n", type_name, count, desc));
    }
    // Also include artifact types that exist in schema but have zero instances
    let mut schema_only_types: Vec<(&String, &rivet_core::schema::ArtifactTypeDef)> = schema
        .artifact_types
        .iter()
        .filter(|(name, _)| !type_counts.iter().any(|(n, _)| n == *name))
        .collect();
    schema_only_types.sort_by_key(|(name, _)| name.to_string());
    for (type_name, type_def) in &schema_only_types {
        let desc = sanitize_for_table(&type_def.description);
        artifact_types_section.push_str(&format!("| `{}` | 0 | {} |\n", type_name, desc));
    }

    // Link types section
    let mut link_types_section = String::new();
    let mut link_type_names: Vec<&String> = schema.link_types.keys().collect();
    link_type_names.sort();
    link_types_section.push_str("| Link Type | Description | Inverse |\n");
    link_types_section.push_str("|-----------|-------------|--------|\n");
    for lt_name in &link_type_names {
        let lt = &schema.link_types[*lt_name];
        let inverse = lt.inverse.as_deref().unwrap_or("-");
        link_types_section.push_str(&format!(
            "| `{}` | {} | `{}` |\n",
            lt_name, lt.description, inverse
        ));
    }

    // Commit traceability section
    let commits_section = if let Some(ref commits) = config.commits {
        let mut s = String::new();
        s.push_str("\n## Commit Traceability\n\n");
        s.push_str("This project enforces commit-to-artifact traceability.\n\n");
        if !commits.trailers.is_empty() {
            s.push_str("Required git trailers:\n");
            let mut trailers: Vec<_> = commits.trailers.iter().collect();
            trailers.sort_by_key(|(k, _)| (*k).clone());
            for (trailer, link_type) in &trailers {
                s.push_str(&format!(
                    "- `{}` -> maps to link type `{}`\n",
                    trailer, link_type
                ));
            }
        }
        if !commits.exempt_types.is_empty() {
            s.push_str(&format!(
                "\nExempt artifact types (no trailer required): {}\n",
                commits
                    .exempt_types
                    .iter()
                    .map(|t| format!("`{}`", t))
                    .collect::<Vec<_>>()
                    .join(", ")
            ));
        }
        s.push_str(&format!(
            "\nTo skip traceability for a commit, add: `{}`\n",
            commits.skip_trailer
        ));
        s
    } else {
        String::new()
    };

    // Build the managed body of AGENTS.md. This is what goes *between* the
    // BEGIN/END rivet-managed markers; markers themselves are added by
    // `managed_section::wrap_fresh` / `splice_managed_section`.
    let sentinel = rivet_core::managed_section::MANAGED_SENTINEL;
    let agents_managed = format!(
        r#"{sentinel}

<!-- rivet-docs-check: ignore SC-1 REQ-001 FEAT-042 -->

# AGENTS.md — Rivet Project Instructions

> This section was generated by `rivet init --agents`. Re-run the command
> any time artifacts change to keep it current.

## Project Overview

This project uses **Rivet** for SDLC artifact traceability.
- Config: `rivet.yaml`
- Schemas: {schema_list}
- Artifacts: {total_count} across {type_count} types
- Validation: `rivet validate` (current status: {validation_status})

## Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `rivet validate` | Check link integrity, coverage, required fields | `rivet validate --format json` |
| `rivet list` | List artifacts with filters | `rivet list --type requirement --format json` |
| `rivet stats` | Show artifact counts by type | `rivet stats --format json` |
| `rivet add` | Create a new artifact | `rivet add -t requirement --title "..." --link "satisfies:SC-1"` |
| `rivet next-id` | Next free ID for a type/prefix (scans all files) | `rivet next-id requirement` |
| `rivet link` | Add a link between artifacts | `rivet link SOURCE -t satisfies --target TARGET` |
| `rivet serve` | Start the dashboard | `rivet serve --port 3000` |
| `rivet export` | Generate HTML reports | `rivet export --format html --output ./dist` |
| `rivet impact` | Show change impact | `rivet impact --since HEAD~1` |
| `rivet coverage` | Show traceability coverage | `rivet coverage --format json` |
| `rivet diff` | Compare artifact versions | `rivet diff --base path/old --head path/new` |

## Artifact Types

{artifact_types_section}
## Working with Artifacts

### File Structure
- Artifacts are stored as YAML files in: {source_paths}
- Schema definitions: `schemas/` directory
- Documents: {doc_paths}

### Creating Artifacts
`rivet add` auto-assigns the next free ID. To see it first — IDs for one type
can span many files, so don't hand-grep a single file — use `rivet next-id`:
```bash
rivet next-id requirement   # next free REQ id, scanning the whole store
rivet add -t requirement --title "New requirement" --status draft --link "satisfies:SC-1"
```

### Validating Changes
Always run `rivet validate` after modifying artifact YAML files.
Use `rivet validate --format json` for machine-readable output.

### Link Types

{link_types_section}
## Conventions

- Artifact IDs follow the pattern: PREFIX-NNN (e.g., REQ-001, FEAT-042)
- Use `rivet add` to create artifacts (auto-generates next ID)
- Always include traceability links when creating artifacts
- Run `rivet validate` before committing
{commits_section}"#
    );

    // Preamble written above the managed section ONLY when the file is
    // fresh. Users can edit this freely; rivet never rewrites it.
    let agents_preamble = "\
<!-- This file has two kinds of content:

     1. A rivet-managed section (between the BEGIN/END rivet-managed markers
        below) that `rivet init --agents` regenerates from your project state.
        Do not edit inside that region — changes are overwritten.

     2. Everything outside the markers, which rivet never touches. Add your
        own sections, audit notes, and project-specific guidance freely,
        above or below the managed region. -->

";

    // Write AGENTS.md using managed-section splice semantics.
    let agents_path = cli.project.join("AGENTS.md");
    write_managed_file(
        &agents_path,
        &agents_managed,
        agents_preamble,
        migrate,
        force_regen,
    )?;

    // Write CLAUDE.md. It's a short shim pointing at AGENTS.md plus
    // Claude-Code-specific hints. Same marker semantics apply.
    let claude_trailer_line = if config.commits.is_some() {
        "- Commit messages require artifact trailers (Implements/Fixes/Verifies/Satisfies/Refs)\n"
    } else {
        ""
    };
    let claude_managed = format!(
        "\
{sentinel}

# CLAUDE.md

See [AGENTS.md](AGENTS.md) for project instructions.

Additional Claude Code settings:
- Use `rivet validate` to verify changes to artifact YAML files
- Use `rivet list --format json` for machine-readable artifact queries
{claude_trailer_line}",
    );
    let claude_preamble = "\
<!-- Like AGENTS.md, this file splits into a rivet-managed region (auto
     regenerated by `rivet init --agents`) and free-form content outside
     the markers (preserved across regenerations). Put any Claude-Code
     specific hand-authored guidance outside the markers. -->

";
    let claude_path = cli.project.join("CLAUDE.md");
    write_managed_file(
        &claude_path,
        &claude_managed,
        claude_preamble,
        migrate,
        force_regen,
    )?;

    println!(
        "\nGenerated AGENTS.md for project '{}' ({} artifacts, {} types)",
        config.project.name, total_count, type_count
    );

    Ok(true)
}

/// Write a managed file using splice semantics.
///
/// Rules, in priority order:
/// 1. File does not exist: write `preamble + wrap_fresh(managed_body)`.
/// 2. File exists with exactly one marker pair: splice.
/// 3. File exists without markers, `--migrate`: wrap existing content.
/// 4. File exists without markers, `--force-regen`: overwrite (warn loudly).
/// 5. File exists without markers, no flag: refuse with `anyhow::bail!`.
/// 6. File has multiple marker pairs (or other structural problems):
///    refuse with the underlying error message.
fn write_managed_file(
    path: &std::path::Path,
    managed_body: &str,
    fresh_preamble: &str,
    migrate: bool,
    force_regen: bool,
) -> Result<()> {
    use rivet_core::managed_section::{
        self, ManagedSectionError, has_markers, migrate_wrap, splice_managed_section, wrap_fresh,
    };

    let file_label = path
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| path.display().to_string());

    if !path.exists() {
        // Fresh file: write preamble + markered block.
        let mut out = String::new();
        out.push_str(fresh_preamble);
        out.push_str(&wrap_fresh(managed_body));
        std::fs::write(path, out).with_context(|| format!("writing {}", path.display()))?;
        println!("  created {}", path.display());
        return Ok(());
    }

    let existing =
        std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?;

    // Fast-path detection so error precedence matches the design doc:
    // `--migrate` only applies when the file has no markers at all; if
    // markers exist we always splice (or surface a multi-marker error).
    if !has_markers(&existing) {
        if migrate {
            let out = migrate_wrap(&existing, managed_body);
            std::fs::write(path, out).with_context(|| format!("writing {}", path.display()))?;
            println!(
                "  migrated {} (wrapped existing content; managed section now on top, prior content preserved below)",
                path.display()
            );
            return Ok(());
        }
        if force_regen {
            eprintln!(
                "warning: --force-regen: overwriting {} with freshly markered content. Any existing content in this file is being discarded.",
                path.display()
            );
            let mut out = String::new();
            out.push_str(fresh_preamble);
            out.push_str(&wrap_fresh(managed_body));
            std::fs::write(path, out).with_context(|| format!("writing {}", path.display()))?;
            println!("  force-regenerated {}", path.display());
            return Ok(());
        }
        anyhow::bail!(
            "{file_label} exists without rivet-managed markers. Refusing to overwrite and destroy existing content.\n\
             Choose one:\n\
               * rivet init --agents --migrate       (safe: wraps existing content below a fresh managed section)\n\
               * rivet init --agents --force-regen   (destructive: replaces the whole file)\n\
               * manually wrap the auto-generated portion with:\n\
                   {begin}\n\
                   ...managed content...\n\
                   {end}\n\
             then re-run `rivet init --agents`.",
            begin = managed_section::BEGIN_MARKER,
            end = managed_section::END_MARKER,
        );
    }

    // File has at least one BEGIN marker — splice (or report structural error).
    match splice_managed_section(&existing, managed_body) {
        Ok(new_content) => {
            std::fs::write(path, new_content)
                .with_context(|| format!("writing {}", path.display()))?;
            println!(
                "  updated {} (managed section only; other content preserved)",
                path.display()
            );
            Ok(())
        }
        Err(ManagedSectionError::MultipleBeginMarkers(lines)) => {
            let lines_str = lines
                .iter()
                .map(|n| n.to_string())
                .collect::<Vec<_>>()
                .join(", ");
            anyhow::bail!(
                "{file_label} has multiple rivet-managed BEGIN markers (lines: {lines_str}). \
                 Refusing to choose which pair to splice. Delete the extras and re-run."
            );
        }
        Err(ManagedSectionError::UnclosedMarker { begin_line }) => {
            anyhow::bail!(
                "{file_label}: BEGIN rivet-managed marker at line {begin_line} has no matching END marker. \
                 Close it with `{end}` and re-run.",
                end = managed_section::END_MARKER,
            );
        }
        Err(ManagedSectionError::OrphanEndMarker { end_line }) => {
            anyhow::bail!(
                "{file_label}: END rivet-managed marker at line {end_line} appears before any BEGIN marker."
            );
        }
        Err(ManagedSectionError::NoMarkers) => {
            // Shouldn't reach here because we checked `has_markers` above,
            // but handle defensively in case the definitions diverge.
            anyhow::bail!(
                "{file_label}: internal error — has_markers reported true but splice found none"
            );
        }
    }
}
