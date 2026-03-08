---
id: SDD-001
type: design
title: Software Design Document — Electronic Braking System
status: approved
glossary:
  EBD: Electronic Brake Force Distribution
  ABS: Anti-lock Braking System
  HCU: Hydraulic Control Unit
  ECU: Electronic Control Unit
  NVM: Non-Volatile Memory
  WCET: Worst-Case Execution Time
  DAC: Digital-to-Analog Converter
  ADC: Analog-to-Digital Converter
  IMU: Inertial Measurement Unit
---

# Software Design Document — Electronic Braking System

## 1. Introduction

This document describes the software design for the Electronic Braking
System (EBS), covering both the Electronic Brake Force Distribution (EBD)
and Anti-lock Braking System (ABS) functions.  The design is structured
into two major software architecture components, each decomposed into
detailed design units.

## 2. Software Architecture Overview

The braking software runs on a dual-core automotive microcontroller.
The architecture is divided into two components aligned with the V-model:

- **[[SWARCH-1]]** — Brake Pressure Manager: responsible for computing
  axle-level brake pressure demands based on driver input and load
  distribution.  Executes in the 10 ms periodic task on Core 0.

- **[[SWARCH-2]]** — ABS Slip Controller: responsible for detecting
  incipient wheel lock-up and modulating brake pressure to maintain
  wheel slip within the target band.  Executes in the 2 ms high-priority
  task on Core 1.

## 3. Detailed Design

### 3.1 Pressure Demand Calculation

The pressure demand function (**[[SWDD-1]]**) is the core of the EBD
subsystem.  It converts driver pedal input into calibrated brake pressure
commands for the front and rear axles.

**Algorithm outline:**

1. Read the 12-bit ADC pedal position (0–4095).
2. Retrieve the current front/rear axle load ratio from the axle load
   estimator.
3. Compute `front_demand = clamp(pedal * front_ratio, 0, 4095)`.
4. Compute `rear_demand = clamp(pedal * rear_ratio, 0, 4095)`.
5. Apply a rate limiter (maximum 500 LSB per 10 ms cycle) to prevent
   hydraulic pressure spikes.
6. Write the results to the HCU valve driver output buffer.

The rate limiter is critical for driver comfort and valve protection.
Calibration constants (ratio bounds, rate limit) are stored in NVM and
can be updated via the UDS WriteDataByIdentifier service.

### 3.2 Wheel Slip Ratio and Phase Selection

The slip controller (**[[SWDD-2]]**) implements the ABS regulation
algorithm.  It runs at 500 Hz (2 ms cycle) to achieve the required
response time.

**Slip ratio computation:**

```
slip[i] = (v_ref - v_wheel[i]) / v_ref
```

where `v_ref` is the estimated vehicle reference speed (maximum of all
wheel speeds) and `v_wheel[i]` is the speed of wheel `i`.  A
divide-by-zero guard clamps the ratio to 0.0 when the vehicle is
stationary.

**Phase state machine (per wheel):**

| Current State | Condition                    | Next State |
|---------------|------------------------------|------------|
| NORMAL        | slip > threshold_high        | BUILD      |
| BUILD         | slip > threshold_release     | HOLD       |
| HOLD          | slip < threshold_low         | RELEASE    |
| RELEASE       | slip < threshold_normal      | NORMAL     |

Threshold values are calibratable NVM parameters with hysteresis to
prevent oscillation at state boundaries.

## 4. Interface Summary

The two architecture components interact through shared data structures
protected by the AUTOSAR RTE mechanism:

| Interface              | Producer      | Consumer       | Rate   |
|------------------------|---------------|----------------|--------|
| Axle load estimate     | [[SWARCH-1]]  | [[SWARCH-1]]   | 10 ms  |
| Pressure demand output | [[SWARCH-1]]  | HCU driver     | 10 ms  |
| Wheel speed input      | Sensor HAL    | [[SWARCH-2]]   | 2 ms   |
| Slip status output     | [[SWARCH-2]]  | Vehicle bus     | 10 ms  |
| HCU phase commands     | [[SWARCH-2]]  | HCU driver     | 2 ms   |

## 5. Resource Budgets

| Component      | Stack  | WCET    | Priority |
|----------------|--------|---------|----------|
| [[SWARCH-1]]   | 2 KiB  | 200 us  | Medium   |
| [[SWARCH-2]]   | 4 KiB  | 400 us  | High     |
