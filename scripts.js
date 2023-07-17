document.addEventListener('DOMContentLoaded', () => {
	const responseBlock = document.getElementById('responseBlock');
	const apiKeyInput = document.getElementById('projectApiKey');

	window.responseBlock = responseBlock
	window.apiKeyInput = apiKeyInput

	// placeholder text
	var jsonStr = {"org name": "Amplitude","account type": "Paid"}
	var escapedJsonStr = JSON.stringify(jsonStr)
		.replace(/[\u007F-\uFFFF]/g, function(chr) {
			return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
		});

	var jsonDataTextarea = document.getElementById('dataInput');
	jsonDataTextarea.placeholder = escapedJsonStr;
})

const apiKeyCheck = () => {
	apiKeyInput.addEventListener('blur', (event) => {
		if (event.target.value.length === 32) {
			const API_KEY = event.target.value
			const httpAPIEndpoint = "https://api2.amplitude.com/2/httpapi"
			const groupIdentifyEndpoint = "https://api2.amplitude.com/groupidentify?api_key=" + API_KEY

			window.API_KEY = API_KEY
			window.httpAPIEndpoint = httpAPIEndpoint
			window.groupIdentifyEndpoint = groupIdentifyEndpoint

			responseBlock.textContent = "API Key entered!"
			console.log("API key successfully entered")

			return [httpAPIEndpoint,groupIdentifyEndpoint]

		} else {
			responseBlock.textContent = "No API Key entered"
		}
	})
}

const postRequest = (url, data) => {
  const response = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  if (response.status === 200) {
		responseBlock.innerHTML = JSON.parse(response.text())
    return response.text;
  } else {
		responseBlock.innerHTML = response.statusText
  }
};

const eventName = document.getElementById('form1Event');
const groupType = document.getElementById('form1GroupType');
const groupValue = document.getElementById('form1GroupValue');
const eventCodeBlock = document.getElementById('eventCodeBlock');
const sendEventButton = document.getElementById("sendEvent");
const time = new Date()
const unixTimestamp = time.getTime()

// checks for API key, then collects form data into a JSON. The full request is printed on the page for the user to view
// If all form data is entered in, the user can hit Send Event to send the event to Amplitude. 
const sendEvent = () => {
	apiKeyCheck();

	const values = [eventName.value, groupType.value, groupValue.value];
	const isFilledOut = values.every(value => value !== '');

	if (isFilledOut) {
		const event = eventName.value;
		const group = groupType.value;
		const groupNames = [groupValue.value];

		const eventsDict = {
			"device_id": "accounts-tool",
			"event_type": event,
			"groups": {
				[group]: groupNames,
				},
			"country": "United States",
			"time": unixTimestamp
		};

		eventCodeBlock.textContent = httpAPIEndpoint;
		eventCodeBlock.textContent += "&events=[" + JSON.stringify(eventsDict) + "]"

		if (event && group && groupNames) {
			sendEventButton.addEventListener("click", () => {

				const requestBody = {
					"api_key": API_KEY,
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
document.addEventListener('DOMContentLoaded', () => {
	apiKeyCheck();

	var userDataTextarea = document.getElementById('dataInput');
	var propsCodeBlock = document.getElementById('propsCodeBlock');

	userDataTextarea.addEventListener('input', function(event) {
		var userData = event.target.value;
		var groupsInfo = {"group_type": groupType.value, "group_value": groupValue.value}

		if (JSON.parse(userData) && JSON.stringify(groupsInfo) && groupType.value.length != 0 && groupValue.value.length != 0) {
			userData = JSON.parse(userData)
			const groupsInfoString = JSON.stringify(groupsInfo)
			const groupProperties = "&identification=" + '{"group_properties":' + JSON.stringify(userData) + ',' + groupsInfoString.substring(1, groupsInfoString.length)
			
			propsCodeBlock.textContent = groupIdentifyEndpoint + groupProperties

			if (propsCodeBlock.textContent) {
				const sendGroupIdentify = document.getElementById("group-properties")

				sendGroupIdentify.addEventListener("click", () => console.log(groupIdentifyEndpoint + groupProperties), 
				postRequest(
					groupIdentifyEndpoint, groupProperties
				));
				console.log("Group Identify request sent successfully")
			}
		} 
	});
})