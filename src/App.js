import React, { useState, useEffect } from 'react';

// The 'declare global' block is TypeScript syntax and removed for JavaScript compatibility.
// window.google.script.run will be available at runtime when deployed as a Google Apps Script Web App.

const RentalBookingApp = () => {
  // Form States
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [trailerTypeCategory, setTrailerTypeCategory] = useState(''); // "Utility" or "Enclosed"
  const [utilityTrailerSize, setUtilityTrailerSize] = useState('');
  const [enclosedTrailerSize, setEnclosedTrailerSize] = useState('');
  const [pickupDateUtility, setPickupDateUtility] = useState('');
  const [pickupTimeUtility, setPickupTimeUtility] = useState('');
  const [returnDateUtility, setReturnDateUtility] = useState('');
  const [returnTimeUtility, setReturnTimeUtility] = useState('');
  const [pickupDateEnclosed, setPickupDateEnclosed] = useState('');
  const [pickupTimeEnclosed, setPickupTimeEnclosed] = useState('');
  const [returnDateEnclosed, setReturnDateEnclosed] = useState('');
  const [returnTimeEnclosed, setReturnTimeEnclosed] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropOffLocation, setDropOffLocation] = useState('');
  const [otherPickupAddress, setOtherPickupAddress] = useState(''); // New state for "Other" pickup address
  const [otherDropOffAddress, setOtherDropOffAddress] = useState(''); // New state for "Other" drop-off address
  const [specialRequests, setSpecialRequests] = useState('');

  // UI States
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCalendarIdForEmbed, setSelectedCalendarIdForEmbed] = useState(''); // New state for calendar embed

  // Predefined options (mirroring Google Form choices)
  const utilityTrailerSizes = ["Utility 6 x 20"];
  const enclosedTrailerSizes = ["Enclosed Trailer", "Enclosed"]; // "Enclosed" for flexibility

  const locationOptions = [
    "7 Eleven Gas Station - 12121 Northwest Expy, Yukon, OK 73099",
    "OnCue Gas Station - 9801 Northwest Expy, Yukon, OK 73099",
    "Other (Specify Address for Delivery)"
  ];

  // Pricing Data (Based on your screenshots for Enclosed Trailer)
  const pricing = {
    'Utility': { // Placeholder for Utility Trailer pricing
      'Utility 6 x 20': {
        'Hourly (4 or less hours)': '$XX/hour', // Please fill this in
        'Daily (24 hours)': '$XX/day', // Please fill this in
        'Weekend': '$XX/weekend', // Please fill this in
        'Weekly (7 Days)': '$XX/week', // Please fill this in
        'Monthly (31 Days)': '$XX/month', // Please fill this in
      }
    },
    'Enclosed': {
      'Enclosed Trailer': {
        'Hourly (4 or less hours)': '$25/hour',
        'Daily (24 hours)': '$100/day',
        'Weekend': '$190/weekend (Fri - Sun)',
        'Weekly (7 Days)': '$550/Week',
        'Monthly (31 Days)': '$1700/Month',
      },
      'Enclosed': { // Duplicate for "Enclosed" if it's treated as a size
        'Hourly (4 or less hours)': '$25/hour',
        'Daily (24 hours)': '$100/day',
        'Weekend': '$190/weekend (Fri - Sun)',
        'Weekly (7 Days)': '$550/Week',
        'Monthly (31 Days)': '$1700/Month',
      }
    }
  };

  // NEW: Google Calendar IDs for embedding (YOU NEED TO REPLACE THESE WITH YOUR ACTUAL CALENDAR IDs)
  const calendarEmbedIds = {
    "Utility 6 x 20": "YOUR_UTILITY_CALENDAR_ID_HERE", // Example: "abcdefg12345@group.calendar.google.com"
    "Enclosed Trailer": "f4c7570d018f85f37f073f5c5e21ed9778f9d9d8f56223010ef56db53c7786c0@group.calendar.google.com", // Updated with provided ID
    "Enclosed": "f4c7570d018f85f37f073f5c5e21ed9778f9d9d8f56223010ef56db53c7786c0@group.calendar.google.com", // Duplicate for flexibility
  };

  // Function to generate time slots from 6 AM to 10 PM in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) { // 6 AM to 10 PM (22:00)
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        slots.push(`${h}:${m}`); // Store in HH:MM format for value
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Effect to update the calendar embed URL when trailer type/size changes
  useEffect(() => {
    let calendarId = '';
    if (trailerTypeCategory === 'Utility' && utilityTrailerSize) {
      calendarId = calendarEmbedIds[utilityTrailerSize];
    } else if (trailerTypeCategory === 'Enclosed' && enclosedTrailerSize) {
      calendarId = calendarEmbedIds[enclosedTrailerSize];
    }
    setSelectedCalendarIdForEmbed(calendarId);
  }, [trailerTypeCategory, utilityTrailerSize, enclosedTrailerSize]);


  // Function to clear all form fields
  const clearForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setPhoneNumber('');
    setTrailerTypeCategory('');
    setUtilityTrailerSize('');
    setEnclosedTrailerSize('');
    setPickupDateUtility('');
    setPickupTimeUtility('');
    setReturnDateUtility('');
    setReturnTimeUtility('');
    setPickupDateEnclosed('');
    setPickupTimeEnclosed('');
    setReturnDateEnclosed('');
    setReturnTimeEnclosed('');
    setPickupLocation('');
    setDropOffLocation('');
    setOtherPickupAddress('');
    setOtherDropOffAddress('');
    setSpecialRequests('');
    setMessage('');
    setMessageType('');
    setSelectedCalendarIdForEmbed(''); // Clear embedded calendar
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    // Construct formData object to send to Google Apps Script
    const formData = {
      'What\'s your Name?': customerName,
      'What\'s your Email?': customerEmail,
      'What\'s Your Phone Number': phoneNumber,
      'Special Requests': specialRequests,
    };

    // Determine actual pickup and drop-off locations to send
    let actualPickupLocation = pickupLocation;
    if (pickupLocation === 'Other (Specify Address for Delivery)') {
      actualPickupLocation = otherPickupAddress;
    }
    formData['Where would you like to pick up your trailer?'] = actualPickupLocation;

    let actualDropOffLocation = dropOffLocation;
    if (dropOffLocation === 'Other (Specify Address for Delivery)') {
      actualDropOffLocation = otherDropOffAddress;
    }
    formData['Where would you like to Drop off your trailer?'] = actualDropOffLocation;


    // Add trailer specific details based on selection
    if (trailerTypeCategory === 'Utility') {
      formData['What size of Utility trailer do you need?'] = utilityTrailerSize;
      formData['What\'s your Desired Pickup Date for the Utility Trailer?'] = pickupDateUtility;
      formData['What\'s your Desired Pickup Time for the Utility Trailer?'] = pickupTimeUtility;
      formData['What\'s your Desired Return Date for the Utility Trailer?'] = returnDateUtility;
      formData['What\'s your Desired Return Time for the Utility Trailer?'] = returnTimeUtility;
    } else if (trailerTypeCategory === 'Enclosed') {
      formData['What size of Enclosed trailer do you need?'] = enclosedTrailerSize;
      formData['What\'s your Desired Pickup Date for the Enclosed Trailer?'] = pickupDateEnclosed;
      formData['What\'s your Desired Pickup Time for the Enclosed Trailer?'] = pickupTimeEnclosed;
      formData['What\'s your Desired Return Date for the Enclosed Trailer?'] = returnDateEnclosed;
      formData['What\'s your Desired Return Time for the Enclosed Trailer?'] = returnTimeEnclosed;
    } else {
      setMessage('Please select a trailer type.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    // Basic validation (can be expanded)
    if (!customerName || !customerEmail || !phoneNumber || !actualPickupLocation || !actualDropOffLocation ||
        (pickupLocation === 'Other (Specify Address for Delivery)' && !otherPickupAddress.trim()) ||
        (dropOffLocation === 'Other (Specify Address for Delivery)' && !otherDropOffAddress.trim()) ||
        (trailerTypeCategory === 'Utility' && (!utilityTrailerSize || !pickupDateUtility || !pickupTimeUtility || !returnDateUtility || !returnTimeUtility)) ||
        (trailerTypeCategory === 'Enclosed' && (!enclosedTrailerSize || !pickupDateEnclosed || !pickupTimeEnclosed || !returnDateEnclosed || !returnTimeEnclosed))
    ) {
      setMessage('Please fill in all required fields, including specific addresses if "Other" is selected.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if google.script.run is available (i.e., running in Apps Script environment)
      if (window.google && window.google.script && window.google.script.run) {
        await window.google.script.run
          .withSuccessHandler((response) => {
            setMessage(response);
            setMessageType('success');
            clearForm(); // Clear form on success
          })
          .withFailureHandler((error) => {
            console.error("Apps Script Error:", error);
            setMessage(`Booking failed: ${error.message}`);
            setMessageType('error');
          })
          .processBookingFromWebApp(formData); // Pass the structured form data
      } else {
        // Fallback for local development or non-Apps Script environment
        console.warn("window.google.script.run is not available. This app is designed to run as a Google Apps Script Web App.");
        setMessage("App is not running in a Google Apps Script environment. Submission will not work.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Client-side Error:", error);
      setMessage(`An unexpected error occurred: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified selectedTrailerPricing to show all pricing for the selected trailer type
  const selectedTrailerPricing =
    trailerTypeCategory === 'Utility' && utilityTrailerSize
      ? pricing.Utility[utilityTrailerSize]
      : trailerTypeCategory === 'Enclosed' && enclosedTrailerSize
      ? pricing.Enclosed[enclosedTrailerSize]
      : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex flex-col items-center font-inter">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-4xl border border-gray-200">
        {/* Logo section removed as per user request */}

        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-800 mb-8 drop-shadow-md">
          OKC Trailer Rentals Booking
        </h1>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-center ${
            messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Your Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-gray-700 text-sm font-medium mb-1">Your Name:</label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-gray-700 text-sm font-medium mb-1">Your Email:</label>
                <input
                  type="email"
                  id="customerEmail"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-medium mb-1">Your Phone Number:</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Trailer Type Selection */}
          <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Choose Your Trailer Type</h2>
            <div>
              <label htmlFor="trailerTypeCategory" className="block text-gray-700 text-sm font-medium mb-1">Select Trailer Category:</label>
              <select
                id="trailerTypeCategory"
                value={trailerTypeCategory}
                onChange={(e) => {
                  setTrailerTypeCategory(e.target.value);
                  // Reset specific trailer sizes when category changes
                  setUtilityTrailerSize('');
                  setEnclosedTrailerSize('');
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">-- Select a Category --</option>
                <option value="Utility">Utility Trailer</option>
                <option value="Enclosed">Enclosed Trailer</option>
              </select>
            </div>

            {trailerTypeCategory === 'Utility' && (
              <div className="mt-4">
                <label htmlFor="utilityTrailerSize" className="block text-gray-700 text-sm font-medium mb-1">What size of Utility trailer do you need?</label>
                <select
                  id="utilityTrailerSize"
                  value={utilityTrailerSize}
                  onChange={(e) => setUtilityTrailerSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Select Size --</option>
                  {utilityTrailerSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

            {trailerTypeCategory === 'Enclosed' && (
              <div className="mt-4">
                <label htmlFor="enclosedTrailerSize" className="block text-gray-700 text-sm font-medium mb-1">What size of Enclosed trailer do you need?</label>
                <select
                  id="enclosedTrailerSize"
                  value={enclosedTrailerSize}
                  onChange={(e) => setEnclosedTrailerSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Select Size --</option>
                  {enclosedTrailerSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Pricing Information Section (Conditionally rendered) */}
          {selectedTrailerPricing && (
            <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Pricing Information for {trailerTypeCategory} Trailer</h2>
              <ul className="list-disc list-inside text-gray-700 text-base space-y-2">
                {Object.entries(selectedTrailerPricing).map(([duration, price]) => (
                  <li key={duration}><strong>{duration}:</strong> {price}</li>
                ))}
              </ul>
              {trailerTypeCategory === 'Utility' && (
                <p className="text-sm text-gray-600 mt-3 italic">
                  (Note: Utility trailer pricing is a placeholder. Please update the `pricing` object in the code with your actual rates.)
                </p>
              )}
            </div>
          )}

          {/* Check Trailer Availability Section */}
          {(trailerTypeCategory && (utilityTrailerSize || enclosedTrailerSize)) && selectedCalendarIdForEmbed && (
            <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Check Trailer Availability</h2>
              <p className="text-gray-700 mb-4">
                View the calendar below to see available dates and times for the selected trailer.
                Please ensure your desired pickup and return times align with open slots.
              </p>
              <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg shadow-md border border-gray-300">
                <iframe
                  src={`https://calendar.google.com/calendar/embed?src=${selectedCalendarIdForEmbed}&ctz=America%2FChicago&mode=week&showTabs=0&showPrint=0&showCalendars=0&showDate=1&showNav=1&showTitle=0`}
                  style={{ border: 0 }}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  title="Google Calendar Availability"
                ></iframe>
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center italic">
                (Note: This calendar shows general availability. Your booking will be confirmed after form submission and manual review.)
              </p>
            </div>
          )}


          {/* Pickup & Return Dates/Times (Conditional) */}
          {(trailerTypeCategory === 'Utility' || trailerTypeCategory === 'Enclosed') && (
            <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Pickup & Return Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pickup Date */}
                <div>
                  <label htmlFor="pickupDate" className="block text-gray-700 text-sm font-medium mb-1">Desired Pickup Date:</label>
                  <input
                    type="date"
                    id="pickupDate"
                    value={trailerTypeCategory === 'Utility' ? pickupDateUtility : pickupDateEnclosed}
                    onChange={(e) => {
                      if (trailerTypeCategory === 'Utility') setPickupDateUtility(e.target.value);
                      else setPickupDateEnclosed(e.target.value);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {/* Pickup Time */}
                <div>
                  <label htmlFor="pickupTime" className="block text-gray-700 text-sm font-medium mb-1">Desired Pickup Time:</label>
                  <select
                    id="pickupTime"
                    value={trailerTypeCategory === 'Utility' ? pickupTimeUtility : pickupTimeEnclosed}
                    onChange={(e) => {
                      if (trailerTypeCategory === 'Utility') setPickupTimeUtility(e.target.value);
                      else setPickupTimeEnclosed(e.target.value);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">-- Select Time --</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {new Date(`2000/01/01 ${slot}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Return Date */}
                <div>
                  <label htmlFor="returnDate" className="block text-gray-700 text-sm font-medium mb-1">Desired Return Date:</label>
                  <input
                    type="date"
                    id="returnDate"
                    value={trailerTypeCategory === 'Utility' ? returnDateUtility : returnDateEnclosed}
                    onChange={(e) => {
                      if (trailerTypeCategory === 'Utility') setReturnDateUtility(e.target.value);
                      else setReturnDateEnclosed(e.target.value);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {/* Return Time */}
                <div>
                  <label htmlFor="returnTime" className="block text-gray-700 text-sm font-medium mb-1">Desired Return Time:</label>
                  <select
                    id="returnTime"
                    value={trailerTypeCategory === 'Utility' ? returnTimeUtility : returnTimeEnclosed}
                    onChange={(e) => {
                      if (trailerTypeCategory === 'Utility') setReturnTimeUtility(e.target.value);
                      else setReturnTimeEnclosed(e.target.value);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">-- Select Time --</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {new Date(`2000/01/01 ${slot}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Pickup & Drop-off Locations */}
          <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Location Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pickupLocation" className="block text-gray-700 text-sm font-medium mb-1">Where would you like to pick up your trailer?</label>
                <select
                  id="pickupLocation"
                  value={pickupLocation}
                  onChange={(e) => {
                    setPickupLocation(e.target.value);
                    setOtherPickupAddress(''); // Clear other address if option changes
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Select Location --</option>
                  {locationOptions.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {pickupLocation === 'Other (Specify Address for Delivery)' && (
                  <input
                    type="text"
                    value={otherPickupAddress}
                    onChange={(e) => setOtherPickupAddress(e.target.value)}
                    placeholder="Enter full pickup address"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    required
                  />
                )}
              </div>
              <div>
                <label htmlFor="dropOffLocation" className="block text-gray-700 text-sm font-medium mb-1">Where would you like to Drop off your trailer?</label>
                <select
                  id="dropOffLocation"
                  value={dropOffLocation}
                  onChange={(e) => {
                    setDropOffLocation(e.target.value);
                    setOtherDropOffAddress(''); // Clear other address if option changes
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Select Location --</option>
                  {locationOptions.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {dropOffLocation === 'Other (Specify Address for Delivery)' && (
                  <input
                    type="text"
                    value={otherDropOffAddress}
                    onChange={(e) => setOtherDropOffAddress(e.target.value)}
                    placeholder="Enter full drop-off address"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    required
                  />
                )}
              </div>
              {(pickupLocation === 'Other (Specify Address for Delivery)' || dropOffLocation === 'Other (Specify Address for Delivery)') && (
                <p className="md:col-span-2 text-sm text-red-600 mt-2 text-center">
                  NOTE: There is a $50/hour that is driven up charge for delivery.
                </p>
              )}
            </div>
          </div>

          {/* Special Requests */}
          <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Special Requests (Optional)</h2>
            <div>
              <label htmlFor="specialRequests" className="block text-gray-700 text-sm font-medium mb-1">Any special requests or notes?</label>
              <textarea
                id="specialRequests"
                rows="3"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="e.g., Need assistance with loading, specific pick-up instructions."
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className={`w-full py-3 px-8 rounded-xl font-bold text-white transition duration-300 shadow-lg transform hover:scale-105 ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Rental Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App component to render RentalBookingApp
const App = () => {
  return <RentalBookingApp />;
};

export default App;
