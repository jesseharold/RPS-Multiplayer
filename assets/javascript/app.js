//global variables
var players = [
	{
		name : "",
		wins : 0,
		losses : 0,
		currentMove : false
	},
	{
		name : "",
		wins : 0,
		losses : 0,
		currentMove : false
	}
];
var database;
var chatHistory = [];
// settings


function initGame(){
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDpkXfloYmdVW9IyEoyfTrAE07OmBKNf8U",
		authDomain: "testing-3cc34.firebaseapp.com",
		databaseURL: "https://testing-3cc34.firebaseio.com",
		storageBucket: "testing-3cc34.appspot.com",
		messagingSenderId: "222650091540"
	};
	firebase.initializeApp(config);
	// get a reference to the database
	database = firebase.database();
	
	// update local data when database changes
	database.ref().on("value", function(snapshot){
		console.log(snapshot[0]);
		//players = snapshot;
	}, function(error){
		console.error(error);
	});

	$("button.play").click(function(){
		makeMove($(this).data("move"), $(this).parent().data("player")-1);
	});
	$("#result").on("click", "#new-game-button", 	newGame);
	$("button.set-name").click(function(){
		var input = $(this).prev("input").val();
		var playerNumber = $(this)
			.parents("section")
			.find("div.buttons")
			.data("player");
		players[playerNumber-1].name = input;
		displayPlayers();
	});
	//empty input when you click on it
	$("input.player-name").on("focus", function(){
		$(this).val("");
	});
	newGame();
}
function makeMove(move, playerID){
	if (!players[playerID].currentMove){
		// prevent someone from making multiple moves in a game
		players[playerID].currentMove = move;

		var otherPlayer = (playerID+1) % 2;
		if (players[otherPlayer].currentMove){
			var winner = testMoves();
			displayWinner(winner);
		}
		//hide buttons until next move
		$("section#player"+(playerID+1)).find("div.buttons").hide();

		// use default value if no player name entered
		if (players[playerID].name === "") {
			players[playerID].name = "Player " + (playerID+1);
		}
	}
	displayPlayers();
}
function displayPlayers(){
	for (var i = 0; i < players.length; i++) {
		var section = $("#player" + (i+1));
		if (players[i].name){
			section.find(".name").text(players[i].name);
		}
		var scoreText = "Wins: " + players[i].wins + ", Losses: " + players[i].losses;
		section.find(".score").text(scoreText);
		if (players[i].currentMove){
			var handImage = $("<img>");
			handImage
				.attr("src", "assets/images/" + players[i].currentMove + ".png")
				.addClass("hand-image");
			section.find(".move").html(handImage);
		} else {
			section.find(".move").html("");
		}
	}
	// store the game each time it changes:
	saveGameToStorage();
}
function testMoves(){
	var moveValues = ["paper", "scissors", "rock"];

	if (players[0].currentMove === "rock"){
		if (players[1].currentMove === "rock"){
			return "tie";
		} else if (players[1].currentMove === "paper"){
			return 1;
		} else if (players[1].currentMove === "scissors"){
			return 0;
		}
	} else if (players[0].currentMove === "paper"){
		if (players[1].currentMove === "rock"){
			return 0;
		} else if (players[1].currentMove === "paper"){
			return "tie";
		} else if (players[1].currentMove === "scissors"){
			return 1;
		}
	} else if (players[0].currentMove === "scissors"){
		if (players[1].currentMove === "rock"){
			return 1;
		} else if (players[1].currentMove === "paper"){
			return 0;
		} else if (players[1].currentMove === "scissors"){
			return "tie";
		}
	}
}
function displayWinner(winnerID){
	if (winnerID === "tie"){
		$("#result #display").text("Tie!");
	} else {
		$("#result #display").text(players[winnerID].name + " wins!");
		players[winnerID].wins++;
		var otherPlayer = (winnerID+1) % 2;
		players[otherPlayer].losses++;
	}
	displayPlayers();
	var newGameButton = $("<button>");
	newGameButton
		.text("Play Again")
		.attr("id", "new-game-button");
	$("#result #display").append(newGameButton);
}
function newGame(){
	for (var i = 0; i < players.length; i++) {
		players[i].currentMove = false;
		//show buttons
		$("section#player"+(i+1)).find("div.buttons").show();
	}
	$("#result #display").empty();
	displayPlayers();

}
function saveGameToStorage(){
	database.ref().set(players);
}


$(document).ready(initGame);