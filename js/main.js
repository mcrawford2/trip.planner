(() => {
	const storageKey = "wanderplan.tripBuilder.formData";
	const builderForm = document.querySelector("#trip-builder-form");
	const itineraryView = document.querySelector("#itinerary-view");
	const tripTitle = document.querySelector("#trip-title");
	const savePdfButton = document.querySelector("#save-pdf-btn");
	const travelerSection = document.querySelector("#traveler-info-section");
	const travelerList = document.querySelector("#traveler-list");
	const flightSection = document.querySelector("#flight-info-section");
	const flightList = document.querySelector("#flight-list");
	const hotelSection = document.querySelector("#hotel-info-section");
	const hotelList = document.querySelector("#hotel-list");
	const embassySection = document.querySelector("#embassy-info-section");
	const embassyList = document.querySelector("#embassy-list");
	const visaSection = document.querySelector("#visa-info-section");
	const visaList = document.querySelector("#visa-list");

	const flightArrayKeys = [
		"flightAirline",
		"flightNumber",
		"flightDepartureCity",
		"flightArrivalCity",
		"flightTimes",
		"flightCost",
		"flightBookingDetails"
	];
	const destinationArrayKeys = ["destinationCity", "destinationCountry", "destinationDates"];
	const travelerArrayKeys = ["travelerName", "travelerPhone", "travelerImportantInfo"];
	const hotelArrayKeys = ["hotelName", "hotelAddress", "hotelDates", "hotelCheckInDetails"];
	const embassyArrayKeys = ["embassyAddress", "embassyEmergencyNumbers", "embassyHours"];
	const visaArrayKeys = ["visaType", "visaValidityDates", "visaDocumentationNotes"];

	if (!builderForm && !itineraryView) {
		return;
	}

	const getFields = (container) => container.querySelectorAll("input[name], textarea[name], select[name]");
	const escapeHtml = (value) =>
		String(value)
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#39;");
	const hasTextContent = (value) => (typeof value === "string" ? value.trim().length > 0 : Boolean(value));
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

	const saveFormState = (form) => {
		try {
			sessionStorage.setItem(storageKey, JSON.stringify(readFormState(form)));
		} catch (error) {
			console.warn("Could not save trip form data to sessionStorage.", error);
		}
	};

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

	const refreshEntryHeadings = (entriesContainer, label) => {
		const entries = entriesContainer?.querySelectorAll("[data-repeat-entry]") ?? [];
		entries.forEach((entry) => {
			const heading = entry.querySelector("[data-entry-heading]");
			if (heading) {
				heading.textContent = label;
			}
		});
	};

	const addRepeatEntry = (entriesContainer, label, shouldFocus = true) => {
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

		if (shouldFocus) {
			const firstField = clone.querySelector("input, textarea, select");
			if (firstField) {
				firstField.focus();
			}
		}
	};

	const ensureRepeatEntryCount = (entriesContainer, label, count) => {
		if (!entriesContainer) {
			return;
		}

		const safeCount = Math.max(1, count);
		const currentCount = entriesContainer.querySelectorAll("[data-repeat-entry]").length;
		for (let i = currentCount; i < safeCount; i += 1) {
			addRepeatEntry(entriesContainer, label, false);
		}

		refreshEntryHeadings(entriesContainer, label);
	};

	const renderFlightList = (savedData) => {
		if (!flightSection || !flightList) {
			return;
		}

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

		const renderDestinationList = (savedData) => {
			const destinationSection = document.querySelector("#destination-info-section");
			const destinationList = document.querySelector("#destination-list");

			if (!destinationSection || !destinationList) {
				return;
			}

			const count = Math.max(getMaxArrayLength(savedData, destinationArrayKeys), hasTextContent(savedData?.destination) ? 1 : 0);
			const entries = [];
			for (let index = 0; index < count; index += 1) {
				const city = getArrayValue(savedData, "destinationCity", index);
				const country = getArrayValue(savedData, "destinationCountry", index);
				const dates = getArrayValue(savedData, "destinationDates", index);
				const legacyDestination = index === 0 ? getArrayValue(savedData, "destination", index) : "";
				const hasPairedDestination = hasTextContent(city) || hasTextContent(country) || hasTextContent(dates);

				if (hasPairedDestination) {
					entries.push({ city, country, dates });
					continue;
				}

				if (hasTextContent(legacyDestination)) {
					entries.push({ legacyDestination });
				}
			}

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
							<div class="sm:col-span-2"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Dates</p><p class="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-white sm:text-2xl">${escapeHtml(destination.dates || "Not set yet")}</p></div>
						</div>
					</div>`
				)
				.join("");
		};

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

	const attachAutosave = (form) => {
		form.addEventListener("input", () => saveFormState(form));
		form.addEventListener("change", () => saveFormState(form));
	};

	if (builderForm) {
		const savedData = getSavedData();
		const flightEntries = builderForm.querySelector("#flight-entries");
		const destinationEntries = builderForm.querySelector("#destination-entries");
		const travelerEntries = builderForm.querySelector("#traveler-entries");
		const hotelEntries = builderForm.querySelector("#hotel-entries");
		const embassyEntries = builderForm.querySelector("#embassy-entries");
		const visaEntries = builderForm.querySelector("#visa-entries");
		const optionalFlight = builderForm.querySelector("#optional-flight");
		const optionalTraveler = builderForm.querySelector("#optional-traveler");
		const optionalHotel = builderForm.querySelector("#optional-hotel");
		const optionalEmbassy = builderForm.querySelector("#optional-embassy");
		const optionalVisa = builderForm.querySelector("#optional-visa");
		const optionalHealth = builderForm.querySelector("#optional-health");
		const addDestinationButton = builderForm.querySelector("#add-destination-btn");
		const addTravelerButton = builderForm.querySelector("#add-traveler-btn");
		const addFlightButton = builderForm.querySelector("#add-flight-btn");
		const addHotelButton = builderForm.querySelector("#add-hotel-btn");
		const addEmbassyButton = builderForm.querySelector("#add-embassy-btn");
		const addVisaButton = builderForm.querySelector("#add-visa-btn");

		ensureRepeatEntryCount(destinationEntries, "Destination", getMaxArrayLength(savedData, destinationArrayKeys));
		ensureRepeatEntryCount(travelerEntries, "Traveler", getMaxArrayLength(savedData, travelerArrayKeys));
		ensureRepeatEntryCount(flightEntries, "Flight", getMaxArrayLength(savedData, flightArrayKeys));
		ensureRepeatEntryCount(hotelEntries, "Hotel", getMaxArrayLength(savedData, hotelArrayKeys));
		ensureRepeatEntryCount(embassyEntries, "Embassy", getMaxArrayLength(savedData, embassyArrayKeys));
		ensureRepeatEntryCount(visaEntries, "Visa", getMaxArrayLength(savedData, visaArrayKeys));

		restoreFields(builderForm, savedData);

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

		if (addFlightButton) {
			addFlightButton.addEventListener("click", () => {
				addRepeatEntry(flightEntries, "Flight", true);
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
				addRepeatEntry(travelerEntries, "Traveler", true);
				saveFormState(builderForm);
			});
		}

		if (addHotelButton) {
			addHotelButton.addEventListener("click", () => {
				addRepeatEntry(hotelEntries, "Hotel", true);
				saveFormState(builderForm);
			});
		}

		if (addEmbassyButton) {
			addEmbassyButton.addEventListener("click", () => {
				addRepeatEntry(embassyEntries, "Embassy", true);
				saveFormState(builderForm);
			});
		}

		if (addVisaButton) {
			addVisaButton.addEventListener("click", () => {
				addRepeatEntry(visaEntries, "Visa", true);
				saveFormState(builderForm);
			});
		}

		builderForm.addEventListener("submit", (event) => {
			event.preventDefault();
			saveFormState(builderForm);
			window.location.href = "itinerary.html";
		});
	}

	if (itineraryView) {
		restoreFields(itineraryView);
		restoreDisplayFields(itineraryView);

		const savedData = getSavedData();
			renderDestinationList(savedData);
		renderTravelerList(savedData);
		if (tripTitle) {
			tripTitle.textContent = savedData?.tripName ? String(savedData.tripName) : "Your Itinerary";
		}

		if (savePdfButton) {
			savePdfButton.addEventListener("click", () => {
				const element = document.querySelector("main");
				const opt = {
					margin: [10, 10, 10, 10],
					filename: `${savedData?.tripName || "WanderPlan-Itinerary"}.pdf`,
					image: { type: "jpeg", quality: 0.98 },
					html2canvas: { scale: 2, logging: false },
					jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
					pagebreak: { mode: ["avoid-all", "css", "legacy"] }
				};
				html2pdf().set(opt).from(element).save();
			});
		}
	}
})();
