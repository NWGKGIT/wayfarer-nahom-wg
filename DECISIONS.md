# Decisions

## Rating

Top rated uses a Bayesian weighted score `(n × average + 5 × 3.5) / (n + 5)`, where `n` is the review count. The five-review prior at 3.5 stars pulls ratings with little evidence toward a moderate baseline. As reviews accumulate, the actual average dominates. This is a deliberately simple, fixed prior rather than a claim about real traveller preferences; changing it changes the ordering. The interface displays the actual average and count, not the adjusted score. The test compares one five-star review with 312 reviews averaging 4.7.

## Booking

Every booking transaction locks its `TourSlot` row with PostgreSQL `SELECT ... FOR UPDATE`, then sums booked seats and creates a booking only if enough capacity remains. Competing transactions for the same slot wait for the lock and read the previous committed booking before making their own decision. Slots do not block one another. Positive seat counts and capacity also have database constraints. All booking writers must use this locking protocol; a direct database insert can bypass the capacity rule. Full slots return HTTP 409 and an explanatory message.

## With more time

I would add request idempotency, cancellation and booking history, accessible keyboard and screen-reader testing, and more realistic seed data. At larger scale I would aggregate ratings in the database and paginate, revisit the prior using actual review distributions, and add operational monitoring. These additions were deferred to keep the take-home focused.
