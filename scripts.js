// placeholder text
var jsonStr = {"org name": "Amplitude","account type": "Paid"}
var escapedJsonStr = JSON.stringify(jsonStr)
	.replace(/[\u007F-\uFFFF]/g, function(chr) {
		return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
	});

var jsonDataTextarea = document.getElementById('dataInput');
jsonDataTextarea.placeholder = escapedJsonStr;

// other page elements 
const responseBlock = document.getElementById('responseBlock');
const API_KEY = "e2f1f1b2b966ce86112d899c315ebfb2"

const apiKeyCheck = () => {
	if (API_KEY) {
		const httpAPIEndpoint = "https://api2.amplitude.com/2/httpapi"
		const groupIdentifyEndpoint = "https://api2.amplitude.com/groupidentify?api_key=" + API_KEY

		globalThis.httpAPIEndpoint = httpAPIEndpoint
		globalThis.groupIdentifyEndpoint = groupIdentifyEndpoint

		return [httpAPIEndpoint, groupIdentifyEndpoint]

	} else {
		responseBlock.textContent = "No API Key entered"
	}
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

const eventInfo = () => {
	apiKeyCheck();

	const values = [eventName.value, groupType.value, groupValue.value];
	const isFilledOut = values.every(value => value !== '');

	if (isFilledOut) {
		const event = eventName.value;
		const group = groupType.value;
		const groupNames = [groupValue.value];

		const eventsDict = {
			"device_id": "change-this-id",
			"event_type": event,
			"groups": {
				[group]: groupNames,
				},
			"time": unixTimestamp
		};

		const eventsDictString = JSON.stringify(eventsDict);

		eventCodeBlock.textContent = httpAPIEndpoint;
		eventCodeBlock.textContent += "&events=[" + eventsDictString + "]"

		if (event && group && groupNames) {
			sendEventButton.addEventListener("click", () => {

				const requestBody = {
					"api_key": API_KEY,
					"events": [eventsDict]
				}

				console.log(httpAPIEndpoint + JSON.stringify(requestBody))
				// postRequest(httpAPIEndpoint, requestBody)
			})
		}
		
		return eventsDictString;
	}
}

eventName.addEventListener('input', eventInfo);
groupType.addEventListener('input', eventInfo);
groupValue.addEventListener('blur', eventInfo);

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
			}
		} 
	});
})