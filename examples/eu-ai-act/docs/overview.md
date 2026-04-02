---
id: DOC-OVERVIEW
title: Predictive Maintenance AI — Compliance Overview
type: specification
status: approved
---

# Predictive Maintenance AI System

## Annex IV Technical Documentation

This project documents a high-risk AI system for predictive maintenance
of critical infrastructure, compliant with EU AI Act Annex IV.

### System Overview

[[AI-SYS-001]] — the core AI system description, classified as **high-risk**
under Annex III, point 2(b) (management and operation of critical infrastructure).

### Design & Data

- [[DS-001]] — Hybrid XGBoost + LSTM prediction model
- [[DGR-001]] — Training data governance with bias assessment

### Risk Management (Art. 9)

- [[RMP-001]] — Continuous risk management process
- [[RA-001]] — Critical risk: missed failure prediction
- [[RA-002]] — Operational risk: false positive alerts
- [[RM-001]] — Mitigation: dual-threshold alert system
- [[RM-002]] — Mitigation: confidence calibration

### Monitoring & Oversight (Art. 12, 14)

- [[MON-001]] — Production drift detection and logging
- [[HO-001]] — Operator dashboard with override capability

### Performance & Transparency (Art. 13, 15)

- [[PE-001]] — Failure prediction accuracy (98.7% critical recall)
- [[TRANS-001]] — Deployer information and known limitations

### Standards & Conformity (Annex IV §7-8)

- [[STD-001]] — ISO/IEC 42001 AI Management System
- [[STD-002]] — ISO/IEC 23894 AI Risk Management
- [[CONF-001]] — EU Declaration of Conformity (pending)

### Post-Market Monitoring (Art. 72)

- [[PMP-001]] — Continuous monitoring plan with incident reporting

## Project Statistics

{{stats}}

## Traceability Coverage

{{coverage}}

## Validation Status

{{diagnostics}}
