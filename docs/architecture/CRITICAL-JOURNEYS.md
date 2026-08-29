# Critical Journey Sequences — Phase 0

**Status:** proposals and gap analysis. Existing appointment operations are named only where evidenced by source/OpenAPI. Proposed lead flows deliberately use logical commands rather than invented provider APIs.

## Home care: observed booking behavior

```mermaid
sequenceDiagram
    actor Patient
    participant Web as Public Web (missing)
    participant ACL as Portal appointment adapter (proposed)
    participant API as Existing Appointment API

    Patient->>Web: Choose service, location/mode, date
    Web->>ACL: Search availability
    ACL->>API: GET /api/v1/availability
    API-->>ACL: Candidate start instants
    ACL-->>Web: Normalized candidates
    Patient->>Web: Select candidate
    Web->>ACL: Create hold + Idempotency-Key
    ACL->>API: POST /api/v1/booking-holds
    API-->>ACL: 201 holdId, expiresAt (actual behavior)
    Patient->>Web: Submit contact/address data
    Web->>ACL: Confirm hold + same-command idempotency key
    ACL->>API: POST /api/v1/appointments/confirm
    API-->>ACL: 201 CONFIRMED or 202 payment flow
    ACL-->>Web: External result
    Note over Web,API: No REQUESTED/PENDING_REVIEW/human-validation state exists
```

This observed behavior is incompatible with the NEXT GEN CARE rule that an immediate acknowledgement is not final confirmation and that final confirmation follows human validation.

## Home care: required human-validation journey

```mermaid
sequenceDiagram
    actor Patient
    participant Web as Public Web
    participant ACL as Appointment anti-corruption layer
    participant API as Accepted appointment contract
    actor Team as Human validation team

    Patient->>Web: Submit booking request
    Web->>ACL: Validated booking command + idempotency key
    ACL->>API: Accepted request operation (UNRESOLVED)
    API-->>ACL: REQUESTED/PENDING_REVIEW (UNRESOLVED)
    ACL-->>Web: Immediate acknowledgement, not confirmation
    Web-->>Patient: Request received + non-emergency notice
    Team->>API: Review request (capability not observed)
    API-->>ACL: CONFIRMED or REJECTED (delivery mechanism unresolved)
    ACL-->>Web: Normalized final status
    Web-->>Patient: Final status notification
```

The `UNRESOLVED` operations are requirements, not claims about the existing API. Production booking is blocked until the appointment owner and Human Engineering Authority accept a real contract supporting this lifecycle.

## Home care: duplicate submission and dependency failure

```mermaid
sequenceDiagram
    actor Patient
    participant Web
    participant ACL as Server-side adapter
    participant API as Appointment API

    Patient->>Web: Submit once
    Web->>ACL: Command + client-generated Idempotency-Key
    ACL->>API: Mutation + same key
    alt API returns a definitive response
        API-->>ACL: Success or RFC 9457 error
        ACL-->>Web: Normalized result
    else Timeout / connection lost
        API--xACL: Outcome unknown
        ACL-->>Web: Safe retry message; do not claim failure or success
        Patient->>Web: Retry same logical command
        Web->>ACL: Same body + same key
        ACL->>API: Replay same mutation + same key
        API-->>ACL: Stored response, or documented concurrent-key 409 requiring bounded retry
        ACL-->>Web: One normalized outcome
    end
```

Rules:

- Never generate a new key for an automatic retry of the same logical mutation.
- Never retry a changed body with the same key.
- Do not retry `4xx` business outcomes.
- Use an explicit connection/response timeout; values require performance evidence.
- No unbounded retry or queue may outlive the hold without an explicit user-visible outcome.
- Until the expired-hold defect is fixed, the adapter must treat hold TTL behavior as unreliable and booking go-live remains blocked.

## Home care: cancellation

```mermaid
sequenceDiagram
    actor Patient
    participant Web
    participant ACL as Server-side adapter
    participant API as Appointment API

    Patient->>Web: Open secure management link
    Web->>ACL: Cancel request + idempotency key
    ACL->>API: POST /api/v1/appointments/{secureAccessToken}/cancel
    API-->>ACL: CANCELLED or documented problem
    ACL-->>Web: Normalized status
    Web-->>Patient: Cancellation outcome and recovery guidance
```

The capability token must not be copied into portal analytics, application logs, referrers, or infrastructure access logs. Whether the portal can avoid a path token entirely depends on an accepted API contract change.

## Home care: rescheduling

```mermaid
sequenceDiagram
    actor Patient
    participant Web
    participant ACL as Server-side adapter
    participant API as Appointment API

    Patient->>Web: Choose new candidate time
    Web->>ACL: Reschedule request + idempotency key
    ACL->>API: POST /api/v1/appointments/{secureAccessToken}/reschedule
    API-->>ACL: Updated CONFIRMED view or conflict/problem
    ACL-->>Web: Normalized outcome
    Web-->>Patient: New time or accessible conflict recovery
```

The existing API keeps status `CONFIRMED` during reschedule. Any portal copy referring to `RESCHEDULED` must be presentation/history semantics approved against the accepted contract, not an invented external state.

## Operating-room: hospital request

```mermaid
sequenceDiagram
    actor Hospital as Hospital representative
    participant Web
    participant Intake as Operating-Room Lead Intake
    participant Delivery as Approved lead delivery/storage
    actor Reviewer as Authorized operations reviewer

    Hospital->>Web: Complete institution request
    Web->>Intake: Typed business request
    Intake->>Intake: Validate, minimize, classify, abuse-check
    Intake->>Delivery: Deliver/store after consent and routing checks
    Delivery-->>Intake: Durable receipt or failure
    Intake-->>Web: Acknowledgement, not staffing confirmation
    Reviewer->>Delivery: Review under RBAC
```

This is lead intake, not a staffing marketplace or assignment workflow.

## Operating-room: professional expression of interest

```mermaid
sequenceDiagram
    actor Nurse as Nurse / healthcare professional
    participant Web
    participant Intake as Professional Lead Intake
    participant Delivery as Approved lead delivery/storage
    actor Reviewer as Authorized reviewer

    Nurse->>Web: Submit expression of interest
    Web->>Intake: Professional contact/qualification lead
    Intake->>Intake: Validate, minimize, separate from patient data
    Intake->>Delivery: Deliver/store
    Delivery-->>Intake: Receipt or failure
    Intake-->>Web: Acknowledgement, not employment/assignment promise
    Reviewer->>Delivery: Review under RBAC
```

## Well-being: qualified enquiry

```mermaid
sequenceDiagram
    actor Visitor
    participant Web
    participant Catalog as Well-Being Catalog
    participant Intake as Well-Being Enquiry Intake
    participant Delivery as Approved lead delivery/storage

    Visitor->>Web: Browse non-medical catalog
    Web->>Catalog: Read localized published content
    Visitor->>Web: Submit enquiry
    Web->>Intake: Minimal contact and service-interest data
    Intake->>Intake: Reject/redirect emergency or medical-detail content
    Intake->>Delivery: Deliver/store approved fields
    Delivery-->>Web: Acknowledgement or recoverable failure
```

## Travel: package comparison and reservation interest

```mermaid
sequenceDiagram
    actor Customer
    participant Web
    participant CMS as Travel Catalog
    participant Intake as Travel Interest Intake
    participant Delivery as Approved lead delivery/storage

    Customer->>Web: View trip/event
    Web->>CMS: Read approved Classic/Gold/Signature configuration
    CMS-->>Web: Inclusions/exclusions/prices only when approved
    Web-->>Customer: Accessible comparison, no payment
    Customer->>Web: Submit reservation interest
    Web->>Intake: Contact, party, accessibility/preferences fields approved for MVP
    Intake->>Delivery: Deliver/store
    Delivery-->>Web: Interest received, not a confirmed reservation
```

No online payment, invoice, deposit, refund, promo-code, or capacity automation is part of this MVP journey.

## Team building: professional enquiry

```mermaid
sequenceDiagram
    actor Company as Company representative
    participant Web
    participant Intake as Team-Building Intake
    participant Delivery as Approved lead delivery/storage

    Company->>Web: Submit organization/event needs
    Web->>Intake: Qualified business enquiry
    Intake->>Intake: Validate, minimize, abuse-check
    Intake->>Delivery: Deliver/store
    Delivery-->>Web: Enquiry acknowledgement
```

## Health-Tech: consultation request

```mermaid
sequenceDiagram
    actor Prospect
    participant Web
    participant Portfolio as Health-Tech Portfolio
    participant Intake as Health-Tech Lead Intake
    participant Delivery as Approved lead delivery/storage

    Prospect->>Web: Browse three approved offer pillars
    Web->>Portfolio: Read published claims/case studies
    Prospect->>Web: Submit consultation request
    Web->>Intake: Business contact and problem statement
    Intake->>Intake: Validate; warn against patient/secret submission
    Intake->>Delivery: Deliver/store
    Delivery-->>Web: Acknowledgement, no certification/SLO promise
```

## Cross-journey failure behavior

| Failure                       | User-visible behavior                                                                                                                                  | System rule                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| CMS unavailable               | Serve last safely published/cacheable content when architecture supports it; otherwise a clear temporary-unavailable page                              | Never substitute draft or wrong-locale content                                          |
| Appointment API timeout       | Outcome-unknown message and safe same-key retry path                                                                                                   | Never create a generic lead containing health data as fallback                          |
| Lead delivery failure         | Do not claim successful delivery; preserve only according to the approved durable-delivery design                                                      | No silent email-only loss                                                               |
| Email failure                 | The core request receipt must remain queryable/operable if storage is approved; show on-screen acknowledgement only when the request itself is durable | Email is a notification, not the sole source of truth unless explicitly accepted by ADR |
| Bot/abuse defense unavailable | Fail according to risk-based policy without leaking submitted data to unapproved third parties                                                         | Privacy-preserving controls only                                                        |
| Locale content missing        | Block publication or show explicit unavailable translation behavior                                                                                    | Never silently show French as Dutch                                                     |
