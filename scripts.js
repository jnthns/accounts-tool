document.addEventListener('DOMContentLoaded', () => {
	const responseBlock = document.getElementById('responseBlock');
	const apiKeyInput = document.getElementById('projectApiKey');

	window.responseBlock = responseBlock
	window.apiKeyInput = apiKeyInput

	apiKeyInput.addEventListener('input', (event) => {
		if (event.target.value.length === 32) {
			const API_KEY = event.target.value
			window.API_KEY = API_KEY

			responseBlock.textContent = "API Key entered!"
			console.log("API key successfully entered")

		} else {
			responseBlock.textContent = "Missing/Invalid API key"
		}
	})
	
	// placeholder text
	const placeholderStr = {"org name": "Amplitude","account type": "Paid"}
	const escapedStr = JSON.stringify(placeholderStr)
		.replace(/[\u007F-\uFFFF]/g, function(chr) {
			return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
		});

	const dataInputArea = document.getElementById('dataInput');
	dataInputArea.placeholder = escapedStr;
})

const postRequest = (url, data) => {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  })
	.then((response) => {
		if (response.status === 200) {
			responseBlock.textContent = "Event sent successfully. Check User Look-up Page!"
		} else {
			responseBlock.textContent = "Invalid params."
		}
	})
};

const customDeviceId = document.getElementById('form1deviceId');
const eventName = document.getElementById('form1Event');
const groupType = document.getElementById('form1GroupType');
const groupValue = document.getElementById('form1GroupValue');
const eventCodeBlock = document.getElementById('eventCodeBlock');
const sendEventButton = document.getElementById("sendEvent");

const userDataTextarea = document.getElementById('dataInput');
const sendGroupPropsButton = document.getElementById("sendGroupProps");
const propsCodeBlock = document.getElementById('propsCodeBlock');

const time = new Date()
const unixTimestamp = time.getTime()

// checks for API key, then collects form data into a JSON. The full request is printed on the page for the user to view
// If all form data is entered in, the user can hit Send Event to send the event to Amplitude. 
const sendEvent = () => {
	const values = [eventName.value, groupType.value, groupValue.value];
	const isFilledOut = values.every(value => value !== '');

	if (isFilledOut) {
		const event = eventName.value;
		const group = [groupType.value];
		const groupNames = [groupValue.value];
		const httpAPIEndpoint = "https://api2.amplitude.com/2/httpapi"

		const eventsDict = {
			"device_id": customDeviceId.value || "accounts-validation-tool",
			"event_type": event,
			"groups": {
				[group]: groupNames,
				},
			"time": unixTimestamp
		};

		eventCodeBlock.textContent = httpAPIEndpoint;
		eventCodeBlock.textContent += "&events=[" + JSON.stringify(eventsDict) + "]"

		if (event && group && groupNames) {
			sendEventButton.addEventListener("click", () => {

				const requestBody = {
					"api_key": window.API_KEY || '<api_key>',
					"events": eventsDict
				}

				postRequest(httpAPIEndpoint, JSON.stringify(requestBody))
				console.log("Event sent successfully")
			})
		}
		
		return eventsDict;
	}
} 

eventName.addEventListener('input', sendEvent);
groupType.addEventListener('input', sendEvent);
groupValue.addEventListener('blur', sendEvent);

// when page loads, check for API key. When the user enters in group properties as JSON, the request is printed on the page for the user to view.
// when the user hits Send Identify, the request is sent to Amplitude.
const groupPropsInput = () => {
	const groupsInfo = {"group_type": groupType.value, "group_value": groupValue.value}
	const API_KEY = window.API_KEY || "<api_key>"
	const groupIdentifyEndpoint = "https://api2.amplitude.com/groupidentify?api_key=" + API_KEY

	try {
		let inputJSON = JSON.parse(userDataTextarea.value)

		if (inputJSON && JSON.stringify(groupsInfo) && groupType.value.length != 0 && groupValue.value.length != 0) {
			const groupsInfoString = JSON.stringify(groupsInfo)
			const groupProperties = "&identification=" + '{"group_properties":' + JSON.stringify(inputJSON) + ',' + groupsInfoString.substring(1, groupsInfoString.length)
			
			propsCodeBlock.textContent = groupIdentifyEndpoint + groupProperties
	
			if (propsCodeBlock.textContent && window.API_KEY) {
				sendGroupPropsButton.addEventListener("click", () => {
					postRequest(groupIdentifyEndpoint, groupProperties),
					console.log("Group Identify request sent successfully")
					}
				);
			}

		} else {
			responseBlock.textContent = "Enter a Group type and Group value(s) on the left to populate the Identify request."
			console.error("Required fields are invalid or missing")
		}

	} catch (error) {
		console.log("Not a valid JSON string")
	}
};

userDataTextarea.addEventListener("input", groupPropsInput)
// sendGroupPropsButton.addEventListener("click", groupPropsInput)