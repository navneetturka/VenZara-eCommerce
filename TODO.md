# TODO - Integrate Admin Order Status with User “My Orders”

## Step 1 (Backend): Implement PUT /api/orders/:id/status

- Add allowed status flow: Processing → Packed → Shipped → Out for Delivery → Delivered
- Validate incoming status values
- Enforce forward-only transitions (no backward updates)
- Update DB and return updated order
  ✅ Done

## Step 2 (Backend): Keep old POST /api/order/status as fallback

- Adapt existing updateStatus to call the new transition validator
- Return updated order too (for better UI refresh)

## Step 3 (Backend): Ensure GET /api/orders filters by logged-in userId

- Verify handler uses req.userId and matches frontend call
- Fix route mounting if needed

## Step 4 (Admin UI): Update dropdown options + refresh on change

- Replace current dropdown options with the 5-step flow labels
- Call PUT /api/orders/:id/status (admin token)
- If PUT fails, fallback to POST /api/order/status during testing

## Step 5 (User UI): Update My Orders tracker to 5-step flow

- Replace tracking steps + completion logic to match backend status labels
- Fetch orders from backend only (no dummy data)
- Style status badge colors: Processing=orange, Shipped=blue, Delivered=green

## Step 6: Smoke tests

- Validate admin transition rules (e.g., Delivered → Processing blocked)
- Validate user GET orders returns only user’s orders
- Validate admin update reflects on user page without errors
