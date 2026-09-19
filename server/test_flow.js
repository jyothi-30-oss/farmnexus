const BASE_URL = (process.env.TEST_API_URL || 'http://localhost:5055/api').replace(/\/+$/, '');

async function testAll() {
  console.log('🌾 Starting FarmNexus Automated End-to-End Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now().toString().slice(-6);
    const farmerPhone = `98${timestamp}10`;
    const buyerPhone = `91${timestamp}20`;

    // 1. Register Farmer
    console.log('1. Testing Farmer Registration...');
    const farmerRegRes = await fetch(`${BASE_URL}/auth/farmer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Kumar',
        phone: farmerPhone,
        password: 'password123',
        village: 'Guntur Rural',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        cropsGrown: ['Rice', 'Red Chilli'],
      }),
    });
    const farmerRegData = await farmerRegRes.json();
    assert(farmerRegData.success === true, 'Farmer registration succeeds');
    assert(farmerRegData.user.role === 'farmer', 'Farmer role is assigned');
    assert(farmerRegData.token !== undefined, 'JWT token is generated');
    const farmerToken = farmerRegData.token;

    // 2. Register Buyer
    console.log('\n2. Testing Buyer Registration...');
    const buyerRegRes = await fetch(`${BASE_URL}/auth/buyer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suresh Wholesale',
        phone: buyerPhone,
        password: 'password123',
        address: 'Shop 42, APMC Grain Yard',
        villageCity: 'Vijayawada',
        district: 'NTR',
        state: 'Andhra Pradesh',
      }),
    });
    const buyerRegData = await buyerRegRes.json();
    assert(buyerRegData.success === true, 'Buyer registration succeeds');
    assert(buyerRegData.user.role === 'buyer', 'Buyer role is assigned');
    const buyerToken = buyerRegData.token;

    // 3. Login Validation
    console.log('\n3. Testing Login and Security Validation...');
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: farmerPhone, password: 'wrongpassword' }),
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginData.success === false, 'Invalid password is rejected');

    const goodLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: farmerPhone, password: 'password123' }),
    });
    const goodLoginData = await goodLoginRes.json();
    assert(goodLoginData.success === true, 'Farmer login with bcrypt succeeds');
    assert(goodLoginData.user.name === 'Ramesh Kumar', 'Farmer profile returned');

    // 4. Create Listing (Farmer)
    console.log('\n4. Testing Listing Creation by Farmer...');
    const createListingRes = await fetch(`${BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        cropName: 'Rice',
        quantity: 500,
        unit: 'kg',
        expectedPricePerUnit: 26, // Market ref is 24, farmer sets 26
      }),
    });
    const listingData = await createListingRes.json();
    assert(listingData.success === true, 'Listing created successfully');
    assert(listingData.listing.marketPrice === 24, 'Reference demo market price (₹24) attached');
    assert(listingData.listing.finalPricePerUnit === 26, 'Farmer expected price becomes final price');
    assert(listingData.listing.availableQuantity === 500, 'Initial available quantity set to 500');
    const listingId = listingData.listing.id;

    // 5. Browse Listings (Buyer)
    console.log('\n5. Testing Buyer Browsing Listings...');
    const browseRes = await fetch(`${BASE_URL}/listings`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const browseData = await browseRes.json();
    assert(browseData.success === true, 'Buyer can fetch active listings');
    const foundListing = browseData.listings.find((l) => l.id === listingId);
    assert(foundListing !== undefined, 'Created listing is visible to buyer');
    assert(foundListing.farmerPhone === farmerPhone, 'Farmer phone is visible to buyer');

    // 6. Buyer Purchase Request (Quantity only)
    console.log('\n6. Testing Purchase Request (Quantity Only)...');
    // Test excessive quantity
    const excessiveRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        listingId,
        requiredQuantity: 9999, // exceeds 500
      }),
    });
    const excessiveData = await excessiveRes.json();
    assert(excessiveData.success === false, 'Request exceeding available quantity is rejected');

    // Valid purchase request
    const purchaseRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        listingId,
        requiredQuantity: 100, // 100 kg @ ₹26 = ₹2,600
      }),
    });
    const purchaseData = await purchaseRes.json();
    assert(purchaseData.success === true, 'Purchase request created successfully');
    assert(purchaseData.request.status === 'PENDING', 'Initial request status is PENDING');
    assert(purchaseData.request.cropAmount === 2600, 'Crop Amount calculated as 100 * 26 = ₹2,600');
    const requestId = purchaseData.request.id;

    // 7. Farmer Views Pending Requests
    console.log('\n7. Testing Farmer Pending Requests View...');
    const pendingRes = await fetch(`${BASE_URL}/requests/farmer`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const pendingData = await pendingRes.json();
    assert(pendingData.success === true, 'Farmer fetches pending requests');
    const foundPending = pendingData.requests.find((r) => r.id === requestId);
    assert(foundPending !== undefined, 'Pending request appears in Buyer Requests');

    // 8. Farmer Accepts Request
    console.log('\n8. Testing Farmer Accept Request...');
    const acceptRes = await fetch(`${BASE_URL}/requests/${requestId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const acceptData = await acceptRes.json();
    assert(acceptData.success === true, 'Farmer accepted request');
    assert(acceptData.order.status === 'ACCEPTED', 'Order created with ACCEPTED status');
    const orderId = acceptData.order.id;

    // Verify request is REMOVED from pending requests view
    const pendingAfterRes = await fetch(`${BASE_URL}/requests/farmer`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const pendingAfterData = await pendingAfterRes.json();
    const stillInPending = pendingAfterData.requests.find((r) => r.id === requestId);
    assert(stillInPending === undefined, 'Accepted request disappears from Buyer Requests view');

    // Verify listing available quantity decremented (500 - 100 = 400)
    const farmerListingsRes = await fetch(`${BASE_URL}/listings/farmer`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const farmerListingsData = await farmerListingsRes.json();
    const updatedListing = farmerListingsData.listings.find((l) => l.id === listingId);
    assert(updatedListing.availableQuantity === 400, 'Listing available quantity reduced from 500 to 400');

    // 9. Delivery Charges Addition
    console.log('\n9. Testing Delivery Charges Calculation...');
    const deliveryRes = await fetch(`${BASE_URL}/orders/${orderId}/delivery-charge`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ deliveryCharge: 150 }),
    });
    const deliveryData = await deliveryRes.json();
    assert(deliveryData.success === true, 'Delivery charge updated');
    assert(deliveryData.order.deliveryCharge === 150, 'Delivery charge set to ₹150');
    assert(deliveryData.order.totalAmount === 2750, 'Total Amount = 2600 + 150 = ₹2,750');

    // 10. Status Transitions: ACCEPTED -> READY -> SHIPPED -> DELIVERED
    console.log('\n10. Testing Order Status Flow (ACCEPTED -> READY -> SHIPPED -> DELIVERED)...');
    // Ready
    const readyRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ status: 'READY' }),
    });
    const readyData = await readyRes.json();
    assert(readyData.order.status === 'READY', 'Status updated to READY');

    // Shipped
    const shippedRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ status: 'SHIPPED' }),
    });
    const shippedData = await shippedRes.json();
    assert(shippedData.order.status === 'SHIPPED', 'Status updated to SHIPPED');

    // Delivered
    const deliveredRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    const deliveredData = await deliveredRes.json();
    assert(deliveredData.order.status === 'DELIVERED', 'Status updated to DELIVERED');

    // 11. Rejection Flow & Immutability
    console.log('\n11. Testing Rejection Flow and Disallowing Status Updates on Rejected Orders...');
    const req2Res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ listingId, requiredQuantity: 50 }),
    });
    const req2Data = await req2Res.json();
    const req2Id = req2Data.request.id;

    // Reject it
    const rejectRes = await fetch(`${BASE_URL}/requests/${req2Id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const rejectData = await rejectRes.json();
    assert(rejectData.success === true, 'Farmer rejected request');
    assert(rejectData.order.status === 'REJECTED', 'Order status set to REJECTED');
    const rejectedOrderId = rejectData.order.id;

    // Attempt to update status of rejected order -> must fail
    const illegalStatusRes = await fetch(`${BASE_URL}/orders/${rejectedOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ status: 'READY' }),
    });
    const illegalStatusData = await illegalStatusRes.json();
    assert(illegalStatusData.success === false, 'Rejected order cannot move to READY, SHIPPED, or DELIVERED');

    // 12. Depleting Inventory to 0 & Automatic Removal
    console.log('\n12. Testing Inventory Depletion to Zero and Auto-Removal...');
    const req3Res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ listingId, requiredQuantity: 400 }), // exactly remaining 400
    });
    const req3Data = await req3Res.json();
    await fetch(`${BASE_URL}/requests/${req3Data.request.id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });

    const browseAfterDepleteRes = await fetch(`${BASE_URL}/listings`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const browseAfterDeplete = await browseAfterDepleteRes.json();
    const depletedFound = browseAfterDeplete.listings.find((l) => l.id === listingId);
    assert(depletedFound === undefined, 'Zero quantity listing automatically removed from active browse listings');

    console.log(`\n========================================`);
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  }
}

testAll();
