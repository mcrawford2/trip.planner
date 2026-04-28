//main.js, has largest chunks of AI generated content. All that was created by AI was still reviewed, tested, and understood by me.

// DOM elements 
// this section helps prevent repeating DOM queries later
(() => {
	//storageKey: stores item in browser sessionStorage under this key
	const storageKey = "wanderplan.tripBuilder.formData";
	const builderForm = document.querySelector("#trip-builder-form");
	const itineraryView = document.querySelector("#itinerary-view");
	const tripTitle = document.querySelector("#trip-title");
	const savePdfButton = document.querySelector("#save-pdf-btn");
	const summaryDestinations = document.querySelector("#summary-destinations");
	const summaryTravelers = document.querySelector("#summary-travelers");
	const summaryTripLength = document.querySelector("#summary-trip-length");
	const summaryTripRange = document.querySelector("#summary-trip-range");
	const summaryOptionalCompleteness = document.querySelector("#summary-optional-completeness");
	const summaryOptionalCount = document.querySelector("#summary-optional-count");
	const summaryOptionalProgress = document.querySelector("#summary-optional-progress");
	const summaryOptionalLabel = document.querySelector("#summary-optional-label");
	const travelerSection = document.querySelector("#traveler-info-section");
	const travelerList = document.querySelector("#traveler-list");
	const budgetSection = document.querySelector("#budget-info-section");
	const budgetList = document.querySelector("#budget-list");
	const flightSection = document.querySelector("#flight-info-section");
	const flightList = document.querySelector("#flight-list");
	const hotelSection = document.querySelector("#hotel-info-section");
	const hotelList = document.querySelector("#hotel-list");
	const embassySection = document.querySelector("#embassy-info-section");
	const embassyList = document.querySelector("#embassy-list");
	const visaSection = document.querySelector("#visa-info-section");
	const visaList = document.querySelector("#visa-list");

	//arrays for optional add-on sectons
	const flightArrayKeys = [
		"flightAirline",
		"flightNumber",
		"flightDepartureCity",
		"flightArrivalCity",
		"flightTimes",
		"flightCost",
		"flightBookingDetails"
	];
	const destinationArrayKeys = ["destinationCity", "destinationCountry", "destinationStartDate", "destinationEndDate"];
	const travelerArrayKeys = ["travelerName", "travelerPhone", "travelerImportantInfo"];
	const budgetArrayKeys = ["budgetTrackingCategory", "budgetTrackingPlannedAmount", "budgetTrackingNotes"];
	const hotelArrayKeys = ["hotelName", "hotelAddress", "hotelDates", "hotelCheckInDetails"];
	const embassyArrayKeys = ["embassyAddress", "embassyEmergencyNumbers", "embassyHours"];
	const visaArrayKeys = ["visaType", "visaValidityDates", "visaDocumentationNotes"];

	//AI created, check for builder form and itinerary view, if neither element exists then script quits early
	if (!builderForm && !itineraryView) {
		return;
	}

	const getFields = (container) => container.querySelectorAll("input[name], textarea[name], select[name]");
	//AI created, helps convert HTML elements to user-friendly text
	const escapeHtml = (value) =>
		String(value)
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#39;");
	const hasTextContent = (value) => (typeof value === "string" ? value.trim().length > 0 : Boolean(value));
	const formatDateValue = (value) => {
		if (!hasTextContent(value)) {
			return "Not set yet";
		}

		//created by AI, for date values, attempts to parse and format them in a user-friendly way.
		const parsedDate = new Date(`${value}T00:00:00`);
		if (Number.isNaN(parsedDate.getTime())) {
			return String(value);
		}

		return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsedDate);
	};
	const parseDateValue = (value) => {
		if (!hasTextContent(value)) {
			return null;
		}

		const parsedDate = new Date(`${value}T00:00:00`);
		return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
	};

	//AI created for top itinerary summary
	const getArrayEntryCount = (savedData, keys) =>
		keys.reduce((count, key) => {
			const value = savedData?.[key];
			if (!Array.isArray(value)) {
				return count;
			}

			const hasEntryContent = value.some((item) => hasTextContent(item));
			return hasEntryContent ? Math.max(count, value.length) : count;
		}, 0);
	const getSectionPresence = (savedData, keys) => keys.some((key) => {
		const value = savedData?.[key];
		return Array.isArray(value) ? value.some((item) => hasTextContent(item)) : hasTextContent(value);
	});

	//AI created, generates progress summary in top itinerary summary
	const getOptionalSectionSummary = (savedData) => {
		const sections = [
			{ label: "Traveler Info", active: getSectionPresence(savedData, travelerArrayKeys) },
			{ label: "Budget Tracking", active: getSectionPresence(savedData, budgetArrayKeys) },
			{ label: "Flight Info", active: getSectionPresence(savedData, flightArrayKeys) },
			{ label: "Hotel Info", active: getSectionPresence(savedData, hotelArrayKeys) },
			{ label: "Embassy Info", active: getSectionPresence(savedData, embassyArrayKeys) },
			{ label: "Visa Info", active: getSectionPresence(savedData, visaArrayKeys) },
			{ label: "Health Info", active: hasTextContent(savedData?.healthInformation) }
		];
		const filledCount = sections.filter((section) => section.active).length;
		return {
			filledCount,
			totalCount: sections.length,
			percentage: sections.length === 0 ? 0 : Math.round((filledCount / sections.length) * 100),
			labels: sections
		};
	};

//AI created, processes destination data from saved form state
	const buildDestinationEntries = (savedData) => {
		const count = Math.max(getMaxArrayLength(savedData, destinationArrayKeys), hasTextContent(savedData?.destination) ? 1 : 0, hasTextContent(savedData?.startDate) || hasTextContent(savedData?.endDate) ? 1 : 0);
		const entries = [];

		for (let index = 0; index < count; index += 1) {
			const city = getArrayValue(savedData, "destinationCity", index);
			const country = getArrayValue(savedData, "destinationCountry", index);
			const startDate = getArrayValue(savedData, "destinationStartDate", index) || (index === 0 ? getArrayValue(savedData, "startDate", index) : "");
			const endDate = getArrayValue(savedData, "destinationEndDate", index) || (index === 0 ? getArrayValue(savedData, "endDate", index) : "");
			const legacyDates = getArrayValue(savedData, "destinationDates", index);
			const legacyDestination = index === 0 ? getArrayValue(savedData, "destination", index) : "";
			const hasPairedDestination = hasTextContent(city) || hasTextContent(country) || hasTextContent(startDate) || hasTextContent(endDate) || hasTextContent(legacyDates);

			if (hasPairedDestination) {
				entries.push({ city, country, startDate, endDate, legacyDates });
				continue;
			}

			if (hasTextContent(legacyDestination)) {
				entries.push({ legacyDestination });
			}
		}

		return entries;
	};

	//AI created, calculates trip duration and formats date rnage for display
	const getTripLengthSummary = (savedData) => {
		const destinationEntries = buildDestinationEntries(savedData);
		const startDate = destinationEntries.map((entry) => parseDateValue(entry.startDate)).find(Boolean) ?? parseDateValue(savedData?.startDate);
		const endDate = destinationEntries.map((entry) => parseDateValue(entry.endDate)).reverse().find(Boolean) ?? parseDateValue(savedData?.endDate);

		if (!startDate || !endDate) {
			return {
				lengthLabel: "Not set yet",
				rangeLabel: "Add destination dates to calculate length"
			};
		}

		const dayDiff = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
		const lengthLabel = `${dayDiff} day${dayDiff === 1 ? "" : "s"}`;
		const rangeLabel = `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(startDate)} - ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(endDate)}`;

		return { lengthLabel, rangeLabel };
	};

	//AI creates, helps with data that is stored as arrays
	const getArrayValue = (savedData, key, index) =>
		Array.isArray(savedData?.[key])
			? String(savedData[key][index] ?? "")
			: index === 0 && typeof savedData?.[key] === "string"
				? String(savedData[key])
				: "";
	const getMaxArrayLength = (savedData, keys) =>
		keys.reduce((max, key) => {
			const value = savedData?.[key];
			return Array.isArray(value) ? Math.max(max, value.length) : max;
		}, 0);

	const getSavedData = () => {
		try {
			const rawValue = sessionStorage.getItem(storageKey);
			return rawValue ? JSON.parse(rawValue) : null;
		} catch (error) {
			console.warn("Could not read trip form data from sessionStorage.", error);
			return null;
		}
	};

	//AI created, converts an HTML form's current field values into a JavaScript object for storage.
	const readFormState = (form) => {
		const formData = {};
		const fields = getFields(form);

		fields.forEach((field) => {
			if (field.name.endsWith("[]")) {
				const key = field.name.slice(0, -2);
				if (!Array.isArray(formData[key])) {
					formData[key] = [];
				}

				if (field.type === "checkbox" || field.type === "radio") {
					formData[key].push(field.checked);
					return;
				}

				formData[key].push(field.value);
				return;
			}

			if (field.type === "checkbox" || field.type === "radio") {
				formData[field.name] = field.checked;
				return;
			}

			formData[field.name] = field.value;
		});

		return formData;
	};

	//AI created, current form state to browser storage
	const saveFormState = (form) => {
		try {
			sessionStorage.setItem(storageKey, JSON.stringify(readFormState(form)));
		} catch (error) {
			console.warn("Could not save trip form data to sessionStorage.", error);
		}
	};

	//AI created, populates form fields in itinerary with previously saved data from builder
	const restoreFields = (container, savedData = getSavedData()) => {

		if (!savedData) {
			return;
		}

		Object.entries(savedData).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				const fields = container.querySelectorAll(`[name="${key}[]"]`);
				fields.forEach((field, index) => {
					const fieldValue = value[index] ?? "";
					if (field.type === "checkbox" || field.type === "radio") {
						field.checked = Boolean(fieldValue);
						return;
					}

					field.value = fieldValue;
				});
				return;
			}

			const field = container.querySelector(`[name="${key}"]`) ?? container.querySelector(`[name="${key}[]"]`);
			if (!field) {
				return;
			}

			if (field.type === "checkbox" || field.type === "radio") {
				field.checked = Boolean(value);
				return;
			}

			field.value = value ?? "";
		});
	};

	//refreshes headings
	const refreshEntryHeadings = (entriesContainer, label) => {
		const entries = entriesContainer?.querySelectorAll("[data-repeat-entry]") ?? [];
		entries.forEach((entry) => {
			const heading = entry.querySelector("[data-entry-heading]");
			if (heading) {
				heading.textContent = label;
			}
		});
	};

	//AI created, creates and manages delete buttons for repeatable entry rows
	const refreshRepeatEntryControls = (entriesContainer, label) => {
		const entries = entriesContainer?.querySelectorAll("[data-repeat-entry]") ?? [];
		const shouldDisableRemoval = entries.length <= 1;

		entries.forEach((entry) => {
			entry.classList.add("relative");

			let removeButton = entry.querySelector("[data-remove-repeat-entry]");
			if (!removeButton) {
				removeButton = document.createElement("button");
				removeButton.type = "button";
				removeButton.dataset.removeRepeatEntry = "true";
				removeButton.setAttribute("aria-label", `Delete ${label} entry`);
				removeButton.className = "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white transition hover:bg-rose-500/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40";
				removeButton.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M3 6h18"></path>
						<path d="M8 6V4h8v2"></path>
						<path d="M19 6l-1 14H6L5 6"></path>
						<path d="M10 11v6"></path>
						<path d="M14 11v6"></path>
					</svg>`;
				entry.prepend(removeButton);
			}

			removeButton.disabled = shouldDisableRemoval;
			removeButton.title = shouldDisableRemoval ? `At least one ${label.toLowerCase()} entry is required` : `Delete ${label} entry`;
		});
	};

	//AI helped, creates and appends a new repeatable entry row to a section
	const addRepeatEntry = (entriesContainer, label, shouldFocus = true, canRemove = false) => {
		if (!entriesContainer) {
			return;
		}

		const templateEntry = entriesContainer.querySelector("[data-repeat-entry]");
		if (!templateEntry) {
			return;
		}

		const clone = templateEntry.cloneNode(true);
		clone.querySelectorAll("input, textarea, select").forEach((field) => {
			if (field.type === "checkbox" || field.type === "radio") {
				field.checked = false;
				return;
			}

			field.value = "";
		});

		entriesContainer.appendChild(clone);
		refreshEntryHeadings(entriesContainer, label);
		if (canRemove) {
			refreshRepeatEntryControls(entriesContainer, label);
		}

		if (shouldFocus) {
			const firstField = clone.querySelector("input, textarea, select");
			if (firstField) {
				firstField.focus();
			}
		}
	};

	//AI created, for repeated entry sections when restoring form data
	const ensureRepeatEntryCount = (entriesContainer, label, count) => {
		if (!entriesContainer) {
			return;
		}

		const safeCount = Math.max(1, count);
		const currentCount = entriesContainer.querySelectorAll("[data-repeat-entry]").length;
		for (let i = currentCount; i < safeCount; i += 1) {
			addRepeatEntry(entriesContainer, label, false, false);
		}

		refreshEntryHeadings(entriesContainer, label);
	};

	//AI created, starts the function for rendering flight information on the itinerary page.
	const renderFlightList = (savedData) => {
		if (!flightSection || !flightList) {
			return;
		}

		//AI helped, extracts flight data from saved form state and displays it on the itinerary page.
		const count = getMaxArrayLength(savedData, flightArrayKeys);
		const entries = [];
		for (let index = 0; index < count; index += 1) {
			const entry = {
				airline: getArrayValue(savedData, "flightAirline", index),
				number: getArrayValue(savedData, "flightNumber", index),
				departureCity: getArrayValue(savedData, "flightDepartureCity", index),
				arrivalCity: getArrayValue(savedData, "flightArrivalCity", index),
				times: getArrayValue(savedData, "flightTimes", index),
				cost: getArrayValue(savedData, "flightCost", index),
				bookingDetails: getArrayValue(savedData, "flightBookingDetails", index)
			};

			const hasContent = Object.values(entry).some((value) => hasTextContent(value));
			if (hasContent) {
				entries.push(entry);
			}
		}

		if (entries.length === 0) {
			flightSection.classList.add("hidden");
			flightList.innerHTML = "";
			return;
		}

		flightSection.classList.remove("hidden");
		flightList.innerHTML = entries
			.map(
				(entry) => `
				<div class="rounded-xl border border-white/20 bg-black/20 p-4 sm:p-5">
					<p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Flight</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Airline</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.airline || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Flight Number</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.number || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Departure City</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.departureCity || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Arrival City</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.arrivalCity || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Times</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.times || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Flight Cost</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.cost || "Not set yet")}</p></div>
						<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Booking Details</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.bookingDetails || "Not set yet")}</p></div>
					</div>
				</div>`
			)
			.join("");
	};

	//AI helped, extracts destination data from saved form state and displays it on the itinerary page
	const renderDestinationList = (savedData) => {
		const destinationSection = document.querySelector("#destination-info-section");
		const destinationList = document.querySelector("#destination-list");

		if (!destinationSection || !destinationList) {
			return;
		}

		const entries = buildDestinationEntries(savedData);

		if (entries.length === 0) {
			destinationSection.classList.add("hidden");
			destinationList.innerHTML = "";
			return;
		}

		destinationSection.classList.remove("hidden");
		destinationList.innerHTML = entries
			.map(
				(destination, index) => `
				<div class="rounded-xl border border-white/20 bg-black/20 p-4 sm:p-5">
					<p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Destination ${index + 1}</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">City</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(destination.legacyDestination ? destination.legacyDestination : destination.city || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Country</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(destination.country || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Start Date</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(formatDateValue(destination.startDate))}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">End Date</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(formatDateValue(destination.endDate))}</p></div>
						${hasTextContent(destination.legacyDates) ? `<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Dates</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(destination.legacyDates)}</p></div>` : ""}
					</div>
				</div>`
			)
			.join("");
	};

	//AI helped, extracts traveler information from saved form state and displays it on the itinerary page.
	const renderTravelerList = (savedData) => {
		if (!travelerSection || !travelerList) {
			return;
		}

		const count = getMaxArrayLength(savedData, travelerArrayKeys);
		const entries = [];
		for (let index = 0; index < count; index += 1) {
			const entry = {
				name: getArrayValue(savedData, "travelerName", index),
				phone: getArrayValue(savedData, "travelerPhone", index),
				importantInfo: getArrayValue(savedData, "travelerImportantInfo", index)
			};

			const hasContent = Object.values(entry).some((value) => hasTextContent(value));
			if (hasContent) {
				entries.push(entry);
			}
		}

		if (entries.length === 0) {
			travelerSection.classList.add("hidden");
			travelerList.innerHTML = "";
			return;
		}

		travelerSection.classList.remove("hidden");
		travelerList.innerHTML = entries
			.map(
				(entry) => `
				<div class="rounded-xl border border-white/20 bg-black/20 p-4 sm:p-5">
					<p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Traveler</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Name</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.name || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Phone Number</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.phone || "Not set yet")}</p></div>
						<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Other Important Info</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.importantInfo || "Not set yet")}</p></div>
					</div>
				</div>`
			)
			.join("");
	};

	//AI helped, extracts budget tracking data from saved form state and displays it on the itinerary page
	const renderBudgetList = (savedData) => {
		if (!budgetSection || !budgetList) {
			return;
		}

		const count = getMaxArrayLength(savedData, budgetArrayKeys);
		const entries = [];
		for (let index = 0; index < count; index += 1) {
			const entry = {
				category: getArrayValue(savedData, "budgetTrackingCategory", index),
				plannedAmount: getArrayValue(savedData, "budgetTrackingPlannedAmount", index),
				notes: getArrayValue(savedData, "budgetTrackingNotes", index)
			};

			const hasContent = Object.values(entry).some((value) => hasTextContent(value));
			if (hasContent) {
				entries.push(entry);
			}
		}

		if (entries.length === 0) {
			budgetSection.classList.add("hidden");
			budgetList.innerHTML = "";
			return;
		}

		budgetSection.classList.remove("hidden");
		budgetList.innerHTML = entries
			.map(
				(entry) => `
				<div class="rounded-xl border border-white/20 bg-black/20 p-4 sm:p-5">
					<p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Budget Item</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Category</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.category || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Planned Amount</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.plannedAmount || "Not set yet")}</p></div>
						<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Notes</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.notes || "Not set yet")}</p></div>
					</div>
				</div>`
			)
			.join("");
	};

	//AI helped, Extracts hotel accommodation data from saved form state and displays it on the itinerary page
	const renderHotelList = (savedData) => {
		if (!hotelSection || !hotelList) {
			return;
		}

		const count = getMaxArrayLength(savedData, hotelArrayKeys);
		const entries = [];
		for (let index = 0; index < count; index += 1) {
			const entry = {
				name: getArrayValue(savedData, "hotelName", index),
				address: getArrayValue(savedData, "hotelAddress", index),
				dates: getArrayValue(savedData, "hotelDates", index),
				checkInDetails: getArrayValue(savedData, "hotelCheckInDetails", index)
			};

			const hasContent = Object.values(entry).some((value) => hasTextContent(value));
			if (hasContent) {
				entries.push(entry);
			}
		}

		if (entries.length === 0) {
			hotelSection.classList.add("hidden");
			hotelList.innerHTML = "";
			return;
		}

		hotelSection.classList.remove("hidden");
		hotelList.innerHTML = entries
			.map(
				(entry) => `
				<div class="rounded-xl border border-white/20 bg-black/20 p-4 sm:p-5">
					<p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Hotel</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Hotel Name</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.name || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Dates</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.dates || "Not set yet")}</p></div>
						<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Address</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.address || "Not set yet")}</p></div>
						<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Check-In Details</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.checkInDetails || "Not set yet")}</p></div>
					</div>
				</div>`
			)
			.join("");
	};

	//AI helped, extracts embassy information from saved form state and displays it on the itinerary page
	const renderEmbassyList = (savedData) => {
		if (!embassySection || !embassyList) {
			return;
		}

		const count = getMaxArrayLength(savedData, embassyArrayKeys);
		const entries = [];
		for (let index = 0; index < count; index += 1) {
			const entry = {
				address: getArrayValue(savedData, "embassyAddress", index),
				emergencyNumbers: getArrayValue(savedData, "embassyEmergencyNumbers", index),
				hours: getArrayValue(savedData, "embassyHours", index)
			};

			const hasContent = Object.values(entry).some((value) => hasTextContent(value));
			if (hasContent) {
				entries.push(entry);
			}
		}

		if (entries.length === 0) {
			embassySection.classList.add("hidden");
			embassyList.innerHTML = "";
			return;
		}

		embassySection.classList.remove("hidden");
		embassyList.innerHTML = entries
			.map(
				(entry) => `
				<div class="rounded-xl border border-white/20 bg-black/20 p-4 sm:p-5">
					<p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Embassy</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Embassy Address</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.address || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Emergency Contact Numbers</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.emergencyNumbers || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Hours</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.hours || "Not set yet")}</p></div>
					</div>
				</div>`
			)
			.join("");
	};

	//Ai helped, extracts visa information from saved form state and displays it on the itinerary page
	const renderVisaList = (savedData) => {
		if (!visaSection || !visaList) {
			return;
		}

		const count = getMaxArrayLength(savedData, visaArrayKeys);
		const entries = [];
		for (let index = 0; index < count; index += 1) {
			const entry = {
				type: getArrayValue(savedData, "visaType", index),
				validityDates: getArrayValue(savedData, "visaValidityDates", index),
				documentationNotes: getArrayValue(savedData, "visaDocumentationNotes", index)
			};

			const hasContent = Object.values(entry).some((value) => hasTextContent(value));
			if (hasContent) {
				entries.push(entry);
			}
		}

		if (entries.length === 0) {
			visaSection.classList.add("hidden");
			visaList.innerHTML = "";
			return;
		}

		visaSection.classList.remove("hidden");
		visaList.innerHTML = entries
			.map(
				(entry) => `
				<div class="rounded-xl border border-white/20 bg-black/20 p-4 sm:p-5">
					<p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Visa</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Visa Type</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.type || "Not set yet")}</p></div>
						<div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Validity Dates</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.validityDates || "Not set yet")}</p></div>
						<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Documentation Notes</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(entry.documentationNotes || "Not set yet")}</p></div>
					</div>
				</div>`
			)
			.join("");
	};

	//AI created, displays the summary dashboard on the itinerary page, finds trip statistics and progress metrics.
	const renderSummaryDashboard = (savedData) => {
		if (!savedData) {
			return;
		}

		const destinationCount = buildDestinationEntries(savedData).length;
		const travelerCount = getArrayEntryCount(savedData, travelerArrayKeys);
		const tripLength = getTripLengthSummary(savedData);
		const optionalSummary = getOptionalSectionSummary(savedData);

		if (summaryDestinations) {
			summaryDestinations.textContent = String(destinationCount);
		}

		if (summaryTravelers) {
			summaryTravelers.textContent = String(travelerCount);
		}

		if (summaryTripLength) {
			summaryTripLength.textContent = tripLength.lengthLabel;
		}

		if (summaryTripRange) {
			summaryTripRange.textContent = tripLength.rangeLabel;
		}

		if (summaryOptionalCompleteness) {
			summaryOptionalCompleteness.textContent = `${optionalSummary.percentage}%`;
		}

		if (summaryOptionalCount) {
			summaryOptionalCount.textContent = `${optionalSummary.filledCount} / ${optionalSummary.totalCount}`;
		}

		if (summaryOptionalProgress) {
			summaryOptionalProgress.style.width = `${optionalSummary.percentage}%`;
		}

		if (summaryOptionalLabel) {
			const activeSections = optionalSummary.labels.filter((section) => section.active).map((section) => section.label);
			summaryOptionalLabel.textContent = activeSections.length > 0 ? `Filled: ${activeSections.join(", ")}` : "No optional sections filled yet";
		}
	};

	//AI created, manages the visibility of optional sections. Shows/hides sections based on whether the user has entered any data to keep the itinerary page clean
	const restoreDisplayFields = (container) => {
		const savedData = getSavedData();
		const optionalSections = container.querySelectorAll("[data-optional-section], [data-optional-fields]");

		optionalSections.forEach((section) => section.classList.add("hidden"));

		if (!savedData) {
			return;
		}

		const displayFields = container.querySelectorAll("[data-field]");

		displayFields.forEach((field) => {
			const key = field.getAttribute("data-field");

			if (!key) {
				return;
			}

			const value = savedData[key];
			field.textContent = value ? String(value) : "Not set yet";
		});

		renderFlightList(savedData);
		renderHotelList(savedData);
		renderEmbassyList(savedData);
		renderVisaList(savedData);

		optionalSections.forEach((section) => {
			const singleKey = section.getAttribute("data-optional-section");
			const groupedKeys = section
				.getAttribute("data-optional-fields")
				?.split(",")
				.map((item) => item.trim())
				.filter(Boolean) ?? [];

			let hasContent = false;
			if (singleKey) {
				const value = savedData[singleKey];
				hasContent = hasTextContent(value);
			}

			if (!hasContent && groupedKeys.length > 0) {
				hasContent = groupedKeys.some((key) => {
					const value = savedData[key];
					if (Array.isArray(value)) {
						return value.some((item) => hasTextContent(item));
					}

					return hasTextContent(value);
				});
			}

			if (hasContent) {
				section.classList.remove("hidden");
			}
		});
	};

	//AI added (but thoroughly checked, like all other AI added abilities), addEventListeners to form fields to trigger autosave on input/change, ensuring the itinerary page reflects the most up to date information.
	const attachAutosave = (form) => {
		form.addEventListener("input", () => saveFormState(form));
		form.addEventListener("change", () => saveFormState(form));
	};

	//AI created. The following is a large conditional block that runs for the builder form to set up all interactions, restore saved data, and attach event listeners.
	// DOM queries and caches
	if (builderForm) {
		const savedData = getSavedData();
		const flightEntries = builderForm.querySelector("#flight-entries");
		const destinationEntries = builderForm.querySelector("#destination-entries");
		const travelerEntries = builderForm.querySelector("#traveler-entries");
		const budgetEntries = builderForm.querySelector("#budget-entries");
		const hotelEntries = builderForm.querySelector("#hotel-entries");
		const embassyEntries = builderForm.querySelector("#embassy-entries");
		const visaEntries = builderForm.querySelector("#visa-entries");
		const optionalFlight = builderForm.querySelector("#optional-flight");
		const optionalTraveler = builderForm.querySelector("#optional-traveler");
		const optionalBudget = builderForm.querySelector("#optional-budget");
		const optionalHotel = builderForm.querySelector("#optional-hotel");
		const optionalEmbassy = builderForm.querySelector("#optional-embassy");
		const optionalVisa = builderForm.querySelector("#optional-visa");
		const optionalHealth = builderForm.querySelector("#optional-health");
		const addDestinationButton = builderForm.querySelector("#add-destination-btn");
		const addTravelerButton = builderForm.querySelector("#add-traveler-btn");
		const addBudgetButton = builderForm.querySelector("#add-budget-btn");
		const addFlightButton = builderForm.querySelector("#add-flight-btn");
		const addHotelButton = builderForm.querySelector("#add-hotel-btn");
		const addEmbassyButton = builderForm.querySelector("#add-embassy-btn");
		const addVisaButton = builderForm.querySelector("#add-visa-btn");
		const removableRepeatEntryLabels = new Map([
			[flightEntries, "Flight"],
			[travelerEntries, "Traveler"],
			[budgetEntries, "Budget Item"],
			[hotelEntries, "Hotel"],
			[embassyEntries, "Embassy"],
			[visaEntries, "Visa"]
		]);

		ensureRepeatEntryCount(destinationEntries, "Destination", getMaxArrayLength(savedData, destinationArrayKeys));
		ensureRepeatEntryCount(travelerEntries, "Traveler", getMaxArrayLength(savedData, travelerArrayKeys));
		ensureRepeatEntryCount(budgetEntries, "Budget Item", getMaxArrayLength(savedData, budgetArrayKeys));
		ensureRepeatEntryCount(flightEntries, "Flight", getMaxArrayLength(savedData, flightArrayKeys));
		ensureRepeatEntryCount(hotelEntries, "Hotel", getMaxArrayLength(savedData, hotelArrayKeys));
		ensureRepeatEntryCount(embassyEntries, "Embassy", getMaxArrayLength(savedData, embassyArrayKeys));
		ensureRepeatEntryCount(visaEntries, "Visa", getMaxArrayLength(savedData, visaArrayKeys));
		removableRepeatEntryLabels.forEach((label, container) => {
			refreshRepeatEntryControls(container, label);
		});

		restoreFields(builderForm, savedData);

		//show optional sections with user data
		const hasFlightData = flightArrayKeys.some((key) => {
			const value = savedData?.[key];
			return Array.isArray(value) ? value.some((item) => hasTextContent(item)) : hasTextContent(value);
		});
		const hasTravelerData = travelerArrayKeys.some((key) => {
			const value = savedData?.[key];
			return Array.isArray(value) ? value.some((item) => hasTextContent(item)) : hasTextContent(value);
		});
		if (optionalTraveler && hasTravelerData) {
			optionalTraveler.classList.remove("hidden");
		}

		const hasBudgetData = budgetArrayKeys.some((key) => {
			const value = savedData?.[key];
			return Array.isArray(value) ? value.some((item) => hasTextContent(item)) : hasTextContent(value);
		});
		if (optionalBudget && hasBudgetData) {
			optionalBudget.classList.remove("hidden");
		}
		if (optionalFlight && hasFlightData) {
			optionalFlight.classList.remove("hidden");
		}

		const hasHotelData = hotelArrayKeys.some((key) => {
			const value = savedData?.[key];
			return Array.isArray(value) ? value.some((item) => hasTextContent(item)) : hasTextContent(value);
		});
		if (optionalHotel && hasHotelData) {
			optionalHotel.classList.remove("hidden");
		}

		const hasEmbassyData = embassyArrayKeys.some((key) => {
			const value = savedData?.[key];
			return Array.isArray(value) ? value.some((item) => hasTextContent(item)) : hasTextContent(value);
		});
		if (optionalEmbassy && hasEmbassyData) {
			optionalEmbassy.classList.remove("hidden");
		}

		const hasVisaData = visaArrayKeys.some((key) => {
			const value = savedData?.[key];
			return Array.isArray(value) ? value.some((item) => hasTextContent(item)) : hasTextContent(value);
		});
		if (optionalVisa && hasVisaData) {
			optionalVisa.classList.remove("hidden");
		}

		if (optionalHealth && hasTextContent(savedData?.healthInformation)) {
			optionalHealth.classList.remove("hidden");
		}

		attachAutosave(builderForm);

		//attaching event listeners for dynamic form interactions
		const optionalToggleButtons = builderForm.querySelectorAll("[data-toggle-target]");
		optionalToggleButtons.forEach((button) => {
			button.addEventListener("click", () => {
				const targetId = button.getAttribute("data-toggle-target");
				if (!targetId) {
					return;
				}

				const target = builderForm.querySelector(`#${targetId}`);
				if (!target) {
					return;
				}

				target.classList.toggle("hidden");

				const firstField = target.querySelector("input, textarea, select");
				if (firstField && !target.classList.contains("hidden")) {
					firstField.focus();
				}
			});
		});

		builderForm.addEventListener("click", (event) => {
			const removeButton = event.target.closest("[data-remove-repeat-entry]");
			if (!removeButton) {
				return;
			}

			const entry = removeButton.closest("[data-repeat-entry]");
			const entriesContainer = entry?.parentElement;
			if (!entry || !entriesContainer || entriesContainer.querySelectorAll("[data-repeat-entry]").length <= 1) {
				return;
			}

			entry.remove();

			const label = removableRepeatEntryLabels.get(entriesContainer);
			if (label) {
				refreshEntryHeadings(entriesContainer, label);
				refreshRepeatEntryControls(entriesContainer, label);
			}

			saveFormState(builderForm);
		});

		if (addFlightButton) {
			addFlightButton.addEventListener("click", () => {
				addRepeatEntry(flightEntries, "Flight", true, true);
				saveFormState(builderForm);
			});
		}

		if (addDestinationButton) {
			addDestinationButton.addEventListener("click", () => {
				addRepeatEntry(destinationEntries, "Destination", true);
				saveFormState(builderForm);
			});
		}

		if (addTravelerButton) {
			addTravelerButton.addEventListener("click", () => {
				addRepeatEntry(travelerEntries, "Traveler", true, true);
				saveFormState(builderForm);
			});
		}

		if (addBudgetButton) {
			addBudgetButton.addEventListener("click", () => {
				addRepeatEntry(budgetEntries, "Budget Item", true, true);
				saveFormState(builderForm);
			});
		}

		if (addHotelButton) {
			addHotelButton.addEventListener("click", () => {
				addRepeatEntry(hotelEntries, "Hotel", true, true);
				saveFormState(builderForm);
			});
		}

		if (addEmbassyButton) {
			addEmbassyButton.addEventListener("click", () => {
				addRepeatEntry(embassyEntries, "Embassy", true, true);
				saveFormState(builderForm);
			});
		}

		if (addVisaButton) {
			addVisaButton.addEventListener("click", () => {
				addRepeatEntry(visaEntries, "Visa", true, true);
				saveFormState(builderForm);
			});
		}

		builderForm.addEventListener("submit", (event) => {
			event.preventDefault();
			saveFormState(builderForm);
			window.location.href = "itinerary.html";
		});
	}

	//AI created, runs for itinerary view, initializes with all data and sets up export functionality
	if (itineraryView) {
		restoreFields(itineraryView);
		restoreDisplayFields(itineraryView);

		const savedData = getSavedData();
		renderSummaryDashboard(savedData);
		renderDestinationList(savedData);
		renderTravelerList(savedData);
		renderBudgetList(savedData);
		if (tripTitle) {
			tripTitle.textContent = savedData?.tripName ? String(savedData.tripName) : "Your Itinerary";
		}

		if (savePdfButton) {
			savePdfButton.addEventListener("click", () => {
				document.body.classList.add("pdf-exporting");

				const cleanupExportMode = () => {
					document.body.classList.remove("pdf-exporting");
				};

				window.addEventListener("afterprint", cleanupExportMode, { once: true });
				window.print();

				setTimeout(cleanupExportMode, 1500);
			});
		}
	}
})();
