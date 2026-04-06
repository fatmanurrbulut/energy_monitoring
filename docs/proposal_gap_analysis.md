# Proposal Gap Analysis

Reference: `230401034_FatmanurBulut_CENG436_IoT_proposal.pdf`

## Section-by-Section Status

1. Project Title
- Status: Done
- Notes: Project scope is reflected in repository and README.

2. Team Information
- Status: Out of code scope
- Notes: Maintained in proposal document.

3. Project Overview
- Status: Partially done
- Notes: End-to-end flow is available with simulator data; hardware path is pending.

4. System Architecture Diagram (Mandatory)
- Status: Pending in repo docs
- Notes: Diagram exists in proposal, but repository-local architecture diagram is not added.

5. Hardware Components
- Status: Planned
- Notes: Hardware list is clear; real wiring and firmware integration are pending.

6. Communication & Network Design
- Status: Done (baseline)
- Notes: Wi-Fi/MQTT star topology assumptions implemented through Docker local network.

7. Application Protocol & Message Design
- Status: Done
- Notes: MQTT topics and JSON payload are implemented.

8. Edge & Cloud Architecture
- Status: Partially done
- Notes: Edge/cloud flow exists with simulator + broker + dashboard; Arduino edge processing path pending.

9. Data Management Plan
- Status: Mostly done (baseline)
- Notes: InfluxDB ingestion and basic historical dashboard chart (last 1h avg power) are implemented; advanced analytics remains.

10. Security & Privacy Considerations (Mandatory)
- Status: Partially done
- Notes: Privacy scope is fine. Broker auth/TLS are still pending (broker currently allows anonymous).

11. Scalability & Device Management Plan
- Status: Partially done
- Notes: Topic/device structure supports scaling; multi-device orchestration and management UI are pending.

12. Technical Requirements (Mandatory)
- Status: Partially done
- Notes: MQTT + edge messaging + dashboard done; physical sensor integration and stronger security pending.

13. Development Plan (12-Week Timeline)
- Status: In progress
- Notes: Dashboard/MQTT prototyping done, integration/testing milestones still pending.

14. Expected Challenges
- Status: Recognized
- Notes: Calibration/noise/reliability work has not been validated in hardware tests yet.

15. Innovation / Extension Ideas (Optional)
- Status: Pending
- Notes: Multi-device/mobile/anomaly detection not started.

16. Testing & Validation Plan
- Status: Pending
- Notes: Structured test report (known load comparison, latency, auth tests) not implemented.

17. Expected Learning Outcomes
- Status: Ongoing
- Notes: MQTT + end-to-end architecture goals are already being practiced.

## Immediate Next Work Items

1. Real sensor pipeline: Arduino serial output -> ESP8266 -> MQTT.
2. Dashboard analytics: extend historical widgets with richer KPIs and anomaly views.
3. Security hardening: Mosquitto authentication + TLS.
4. Validation: create measurable test protocol and test log.
