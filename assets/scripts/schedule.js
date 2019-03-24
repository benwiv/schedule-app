
const config = {
  apiKey: "AIzaSyB6kpllTyfD79o3NWweZRCyVK2ZX1LZJNI",
  authDomain: "ben-w-train-schedule.firebaseapp.com",
  databaseURL: "https://ben-w-train-schedule.firebaseio.com",
  projectId: "ben-w-train-schedule",
  storageBucket: "ben-w-train-schedule.appspot.com",
  messagingSenderId: "997444934650"
};

firebase.initializeApp(config);

const database = firebase.database();

const timeToMins = function(stringInput){
  let hours = parseInt(stringInput.slice(0,2))*60;
  let mins = parseInt(stringInput.slice(2,4));
  let totalTime = hours+mins;
  return totalTime;
};

const minsToTime = function(minutes){
  let mins = function(){
    if (minutes%60<10){
      return '0' + String(minutes%60);
    }
    else {
      return String(minutes%60);
    }
  };
  let hours = String(Math.floor(minutes/60));
  return `${hours}:${mins()}`;
}

$("#submit-train-btn").on("click", function(event) {
  event.preventDefault();

  const trainName = $("#train-name-input").val().trim();
  const trainDestination = $("#destination-input").val().trim();
  const firstTrainTime = $("#train-time-input").val();
  const frequencyValue = $("#frequency-input").val();
  const trainDepartureList = [];

  for (let i=0; i<1440-(timeToMins(firstTrainTime)); i+=parseInt(frequencyValue)) {
    let trainFirst = timeToMins(firstTrainTime)+i;

    if (trainFirst > 1440) {
      trainDepartureList.push(trainFirst-1440);
    }
    else {
      trainDepartureList.push(trainFirst);
    }
  };

  const newTrain = {
    name: trainName,
    destination: trainDestination,
    firstTrain: firstTrainTime,
    frequency: frequencyValue,
    trainDepartures: trainDepartureList
  };

  database.ref().push(newTrain);

  console.log(newTrain.name);
  console.log(newTrain.destination);
  console.log(newTrain.firstTrain);
  console.log(newTrain.frequency);

  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#train-time-input").val("");
  $("#frequency-input").val("");
});

database.ref().on("child_added", function(childSnapshot) {
  const trainName = childSnapshot.val().name;
  const trainDestination = childSnapshot.val().destination;
  const firstTrainTime = childSnapshot.val().firstTrain;
  const frequencyValue = childSnapshot.val().frequency;
  const trainDeparturesArray = childSnapshot.val().trainDepartures;
  const currentTime = timeToMins(moment().format('HHmm'));
  const departureMinsUntilArray = [];

  for(let j=0; j<trainDeparturesArray.length; j++){
    if (currentTime>trainDeparturesArray[j]){
      departureMinsUntilArray.push((1440-currentTime) + trainDeparturesArray[j]);
    }
    else {
      departureMinsUntilArray.push(trainDeparturesArray[j]-currentTime);
    };
  }

  let nearestTrain = function(arrayDepTimes){
    return arrayDepTimes.indexOf(Math.min.apply(Math, arrayDepTimes))
  };

  const trainArrival = Math.min.apply(Math,departureMinsUntilArray);

  const newRow = $("<tr>").append(
    $("<td>").text(trainName),
    $("<td>").text(trainDestination),
    $("<td>").text(frequencyValue),
    $("<td>").text(minsToTime(trainDeparturesArray[nearestTrain(departureMinsUntilArray)])),
    $("<td>").text(trainArrival)
);

  $("#train-table > tbody").append(newRow);
});