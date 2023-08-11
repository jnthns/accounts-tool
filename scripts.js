document.addEventListener('DOMContentLoaded', () => {
	!function(){"use strict";!function(e,t){var n=e.amplitude||{_q:[],_iq:{}};if(n.invoked)e.console&&console.error&&console.error("Amplitude snippet has been loaded.");else{var r=function(e,t){e.prototype[t]=function(){return this._q.push({name:t,args:Array.prototype.slice.call(arguments,0)}),this}},s=function(e,t,n){return function(r){e._q.push({name:t,args:Array.prototype.slice.call(n,0),resolve:r})}},o=function(e,t,n){e[t]=function(){if(n)return{promise:new Promise(s(e,t,Array.prototype.slice.call(arguments)))}}},i=function(e){for(var t=0;t<m.length;t++)o(e,m[t],!1);for(var n=0;n<y.length;n++)o(e,y[n],!0)};n.invoked=!0;var a=t.createElement("script");a.type="text/javascript",a.integrity="sha384-lI19/rkWkq7akQskdqbaYBssAwNImFV9Iwejq7dylnP0Yx8TyWYX1PwAoaA5xrUp",a.crossOrigin="anonymous",a.async=!0,a.src="https://cdn.amplitude.com/libs/analytics-browser-2.1.3-min.js.gz",a.onload=function(){e.amplitude.runQueuedFunctions||console.log("[Amplitude] Error: could not load SDK")};var c=t.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c);for(var u=function(){return this._q=[],this},l=["add","append","clearAll","prepend","set","setOnce","unset","preInsert","postInsert","remove","getUserProperties"],p=0;p<l.length;p++)r(u,l[p]);n.Identify=u;for(var d=function(){return this._q=[],this},f=["getEventProperties","setProductId","setQuantity","setPrice","setRevenue","setRevenueType","setEventProperties"],v=0;v<f.length;v++)r(d,f[v]);n.Revenue=d;var m=["getDeviceId","setDeviceId","getSessionId","setSessionId","getUserId","setUserId","setOptOut","setTransport","reset","extendSession"],y=["init","add","remove","track","logEvent","identify","groupIdentify","setGroup","revenue","flush"];i(n),n.createInstance=function(e){return n._iq[e]={_q:[]},i(n._iq[e]),n._iq[e]},e.amplitude=n}}(window,document)}();

	amplitude.init("d0f08400e511c1741a74666c43d1ace4", {
		defaultTracking: false
	});

	const amp = window.amplitude
	let event_properties = {}
	const responseBlock = document.getElementById('responseBlock');
	const apiKeyInput = document.getElementById('projectApiKey');

	window.responseBlock = responseBlock
	window.apiKeyInput = apiKeyInput

	apiKeyInput.addEventListener('input', (event) => {
		if (event.target.value.length === 32) {
			const API_KEY = event.target.value
			window.API_KEY = API_KEY

			event_properties['apiKey'] = API_KEY
			amp.track("Entered API Key", event_properties)

			responseBlock.textContent = "API Key entered!"
			console.log("API key successfully entered")

		} else {
			responseBlock.textContent = "Missing/Invalid API key"
			event_properties['field'] = "api key input"
			event_properties['invalid input'] = event.target.value
			amp.track("Entered Invalid Field", event_properties)
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