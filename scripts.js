var jsonStr = {"org name": "Amplitude","account type": "Paid"}
var escapedJsonStr = JSON.stringify(jsonStr)
	.replace(/[\u007F-\uFFFF]/g, function(chr) {
		return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
	});

var jsonDataTextarea = document.getElementById('dataInput');
jsonDataTextarea.placeholder = escapedJsonStr;

const responseBlock = document.getElementById('responseBlock');
const API_KEY = "e2f1f1b2b966ce86112d899c315ebfb2"

const postRequest = (url, data) => {
  const response = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  if (response.status === 200) {
		responseBlock.innerHTML = response.statusText
    return response.text;
  } else {
		responseBlock.innerHTML = response.statusText
  }
};

var eventName = document.getElementById('form1Event');
var groupType = document.getElementById('form1GroupType');
var groupValue = document.getElementById('form1GroupValue');
var eventCodeBlock = document.getElementById('eventCodeBlock');
const time = new Date()
const unixTimestamp = time.getTime()
let eventsDict = {};

    const eventInfo = function() {
      const values = [eventName.value, groupType.value, groupValue.value];
      const isFilledOut = values.every(value => value !== '');

      if (isFilledOut) {
        const event = eventName.value;
        const group = groupType.value;
        const groupNames = [groupValue.value];

        eventsDict = {
          "event_type": event,
          "groups": {
            [group]: groupNames,
            },
          "time": unixTimestamp
        };
        
        eventCodeBlock.innerHTML = "https://api2.amplitude.com/2/httpapi?api_key=e2f1f1b2b966ce86112d899c315ebfb2&events=[";
        eventCodeBlock.innerHTML += JSON.stringify(eventsDict) + "]"
        return eventsDict;
      }
    };

    eventName.addEventListener('input', eventInfo);
    groupType.addEventListener('input', eventInfo);
    groupValue.addEventListener('input', eventInfo);

		const groupIdentifyEndpoint = "https://api2.amplitude.com/groupidentify?api_key=" + API_KEY

    document.addEventListener('DOMContentLoaded', function() {
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

						sendGroupIdentify.addEventListener("click", function() {
							console.log(groupIdentifyEndpoint + groupProperties)
							postRequest(
								groupIdentifyEndpoint, groupProperties
							)
						})
					}
				} 
      });
    });