// Initialize Firebase
var config = {
apiKey: "AIzaSyBnjWU8BM2kjbav5bz3hAposDvssdOirZs",
authDomain: "rockpaperscissors-6d861.firebaseapp.com",
databaseURL: "https://rockpaperscissors-6d861.firebaseio.com",
projectId: "rockpaperscissors-6d861",
storageBucket: "rockpaperscissors-6d861.appspot.com",
messagingSenderId: "405648213523"
};

firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();

// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
var myUserName = "";
var myKey = "";
var game = database.ref("/currentGame")
var myGame;
var gameRound = 0;
var myConnections
var divButtons = $("#rps-buttons")
var divInput = $("#input-form")
var divNarrator = $("#narrator")
var divVs = $("#vs")
var divPlayer1Name = $("#player1")
var divPlayer2Name = $("#player2")
var divPlayer1Score = $("#score1")
var divPlayer2Score = $("#score2")
var divRound = $("#round")
var curPlayer1Selection = "";
var curPlayer2Selection = "";
var roundLimit = 5;



connectedRef.on("value", function(snap) {
    // If they are connected..
    if (snap.val()) {
        // Add user to the connections list.
        var con = connectionsRef.push(true);
        myKey = con.key
        
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
   
    };
});

game.on("value", function(snap) {
    myGame = snap.val();
    curPlayer1Selection = myGame.player1CurrentSelection;
    curPlayer2Selection = myGame.player2CurrentSelection;
    gameRound = myGame.round;

    if (myGame.player1 !== "" && myGame.player2 !== "") {
        game.update({
            isOpen: false,
        });
    } else {
        game.update({
            isOpen: true,
        });
    };

    if (!myGame.isOpen && myGame.round === 1) {
        if (myKey===myGame.player1 || myKey===myGame.player2) {
            updateGame();
        } else {
            divNarrator.text("Sorry!! Other players are already playing.  Please wait");
            divInput.css("visibility", "hidden");
        };
    };

    function playersTie() {
        setTimeout(function(){ divNarrator.text("It was a push. You both went with "+ curPlayer1Selection + "." ) }, 10);
        setTimeout(function(){
            game.update({
                player1CurrentSelection: "",
                player2CurrentSelection: "",
            });
            nextRound();
        }, 1000);
    };

    function player2Won() {
        var myWins = myGame.player2Wins;
        myWins++;
        gameRound++;


        if (myKey===myGame.player2) {
            setTimeout(function(){ divNarrator.text("You Won!! Your " + curPlayer2Selection + " beats your opponent's " + curPlayer1Selection + ".") }, 10);
        } else {
            setTimeout(function(){ divNarrator.text("Sorry You Lost. Your " + curPlayer1Selection + " loses to your opponent's " + curPlayer2Selection + "." ) }, 10);
        };

        setTimeout(function(){
            game.update({
                player2Wins: myWins,
                player1CurrentSelection: "",
                player2CurrentSelection: "",
                round: gameRound,
            });
            nextRound();
        }, 1000);
    };

    function player1Won() {
        var myWins = myGame.player1Wins;
        myWins++;
        gameRound++;
        

        if (myKey===myGame.player1) {
            setTimeout(function(){ divNarrator.text("You Won!! Your " + curPlayer1Selection + " beats your opponent's " + curPlayer2Selection + ".") }, 10);
        } else {
            setTimeout(function(){ divNarrator.text("Sorry You Lost. Your " + curPlayer2Selection + " loses to your opponent's " + curPlayer1Selection + "." ) }, 10);
        };
        
        setTimeout(function(){
            game.update({
                player1Wins: myWins,
                player1CurrentSelection: "",
                player2CurrentSelection: "",
                round: gameRound,
            });
            nextRound();
        }, 100);
    };

    function nextRound() {

        if (gameRound > roundLimit) {
            divRound.css("visibility", "hidden");
            divButtons.css("visibility", "hidden");
            divPlayer1Score.text(myGame.player1Wins);
            divPlayer2Score.text(myGame.player2Wins);
            divNarrator.text("Game Over!!!");
    
        } else {
            var count = 3
            $("#countdown").text(count);
            $("#countdown-area").css("visibility", "visible");
            $("#countdown-area").css("height", "auto");

            var myCountDown = setInterval(function(){ 
                if (count<0) {
                    clearInterval(myCountDown);
                    updateGame();
                    $("#rock-selection").css("visibility", "visible");
                    $("#paper-selection").css("visibility", "visible");
                    $("#scissors-selection").css("visibility", "visible");
                } else {
                    $("#countdown").text(count);
                    count--
                };
            }, 1000);
        }
    }


    if (curPlayer1Selection !== "" && curPlayer2Selection !== "") {
        if (curPlayer1Selection === curPlayer2Selection) {
            playersTie();
        } else if (curPlayer1Selection === "rock" && curPlayer2Selection === "paper") {
            player2Won();
        } else if (curPlayer1Selection === "rock" && curPlayer2Selection === "scissors") {
            player1Won();
        } else if (curPlayer1Selection === "paper" && curPlayer2Selection === "rock") {
            player1Won();
        } else if (curPlayer1Selection === "paper" && curPlayer2Selection === "scissors") {
            player2Won();
        } else if (curPlayer1Selection === "scissors" && curPlayer2Selection === "rock") {
            player2Won();
        } else if (curPlayer1Selection === "scissors" && curPlayer2Selection === "paper") {
            player1Won();
        }
    };
});

function updateGame() {
    
    divButtons.css("visibility", "visible");

    divInput.empty();
    divVs.text("vs");
    divPlayer1Name.text(myGame.player1Name);
    divPlayer2Name.text(myGame.player2Name);
    divPlayer1Score.text(myGame.player1Wins);
    divPlayer2Score.text(myGame.player2Wins);
    divRound.text("Round " + myGame.round + " of " + roundLimit + ".");
    divNarrator.css("visibility", "visible")
    divNarrator.text("Please select Rock, Paper or Scissors!");
    $("#countdown-area").css("visibility", "hidden");
    $("#countdown-area").css("height", "0");
    
    
};



// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {
    myConnections = snap.val();
    
    // if connection is updated with a connection that isn't player 1 or player 2, update database to clear game
    if (myConnections[myGame.player1] == null) {
        game.update({
            player1: "",
            player1CurrentSelection: "",
            player1Name: "",
            player1Wins: 0,
            round: 1
        });
    };
    if (myConnections[myGame.player2] == null) {
        game.update({
            player2: "",
            player2CurrentSelection: "",
            player2Name: "",
            player2Wins: 0,
            round: 1
        });
    };
   
});


$(".rps-selection").click(function(){
    var mySelection = this.id
    
    
    if (mySelection === "rock-selection") {
        $("#paper-selection").css("visibility", "hidden");
        $("#scissors-selection").css("visibility", "hidden");
        setTimeout(function(){ divNarrator.text("You've selected Rock. Waiting on opponent to complete selection.") }, 10);
    } else if (mySelection === "paper-selection") {
        $("#rock-selection").css("visibility", "hidden");
        $("#scissors-selection").css("visibility", "hidden");
        setTimeout(function(){ divNarrator.text("You've selected Paper. Waiting on opponent to complete selection.") }, 10);
    } else if (mySelection === "scissors-selection") {
        $("#paper-selection").css("visibility", "hidden");
        $("#rock-selection").css("visibility", "hidden");
        setTimeout(function(){ divNarrator.text("You've selected Scissors. Waiting on opponent to complete selection.") }, 10);
    };

    updateMySelection(myKey, mySelection);
});

function updateMySelection(key, sel) {
    sel = sel.substring(0, sel.indexOf('-'))
    
    if (key === myGame.player1) {
        game.update({
            player1CurrentSelection: sel,
        });
        // curPlayer1Selection = sel;
    } else if (key === myGame.player2) {
        game.update({
            player2CurrentSelection: sel,
        });
        // curPlayer2Selection = sel;
    };
};




$( document ).ready(function() {
    
    divButtons.css("visibility", "hidden");


    $("#add-user").on("click", function(event) {
        event.preventDefault();

        myUserName = $("#username-input").val().trim();
        
        if (myGame.isOpen && myGame.player1 === "") {
            divInput.empty();
            game.update({
                isOpen: true,
                player1: myKey,
                player1CurrentSelection: "",
                player1Name: myUserName,
                player1Wins: 0,
                player2: "",
                player2CurrentSelection: "",
                player2Wins: 0,
                round: 1,
            });
            divNarrator.text("Welcome, " + myGame.player1Name + "! Please sit tight. Your opponent hasn't joined yet.");
            
        } else if (myGame.isOpen) {
            game.update({
                isOpen: false,
                // player1: myKey,
                player1CurrentSelection: "",
                player1Wins: 0,
                player2: myKey,
                player2CurrentSelection: "",
                player2Name: myUserName,
                player2Wins: 0,
                round: 1,
            });
        }
        
    });
    
});