(() => {
	const storageKey = "wanderplan.tripBuilder.formData";
	const builderForm = document.querySelector("#trip-builder-form");
	const itineraryView = document.querySelector("#itinerary-view");

	if (!builderForm && !itineraryView) {
		return;
	}

	const getFields = (container) => container.querySelectorAll("input[name], textarea[name], select[name]");

	const getSavedData = () => {
		try {
			const rawValue = localStorage.getItem(storageKey);
			return rawValue ? JSON.parse(rawValue) : null;
		} catch (error) {
			console.warn("Could not read trip form data from localStorage.", error);
			return null;
		}
	};

	const readFormState = (form) => {
		const formData = {};
		const fields = getFields(form);

		fields.forEach((field) => {
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
			localStorage.setItem(storageKey, JSON.stringify(readFormState(form)));
		} catch (error) {
			console.warn("Could not save trip form data to localStorage.", error);
		}
	};

	const restoreFields = (container) => {
		const savedData = getSavedData();

		if (!savedData) {
			return;
		}

		const fields = getFields(container);

		fields.forEach((field) => {
			if (!(field.name in savedData)) {
				return;
			}

			if (field.type === "checkbox" || field.type === "radio") {
				field.checked = Boolean(savedData[field.name]);
				return;
			}

			field.value = savedData[field.name] ?? "";
		});
	};

	const attachAutosave = (form) => {
		restoreFields(form);
		form.addEventListener("input", () => saveFormState(form));
		form.addEventListener("change", () => saveFormState(form));
	};

	if (builderForm) {
		attachAutosave(builderForm);
		builderForm.addEventListener("submit", (event) => {
			event.preventDefault();
			saveFormState(builderForm);
			window.location.href = "itinerary.html";
		});
	}

	if (itineraryView) {
		restoreFields(itineraryView);
	}
})();
