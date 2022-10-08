// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { getDatabase, ref, set, onDisconnect, onValue, onChildAdded, onChildRemoved, get, child } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDm-Je7iI-Nh1wtNaR3UwyzMR1LgciRZbU",
    authDomain: "chat-a10b9.firebaseapp.com",
    databaseURL: "https://chat-a10b9-default-rtdb.firebaseio.com",
    projectId: "chat-a10b9",
    storageBucket: "chat-a10b9.appspot.com",
    messagingSenderId: "1032811906518",
    appId: "1:1032811906518:web:1df866ea269fbf6ecb9077"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

var cont = document.getElementById("pagecontainer");

var crbform = document.getElementById("createroombuttonform");
crbform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    loadcreateroom();
//    loadchatroom(Date.now());

    crbform.reset();
});

var jrbform = document.getElementById("joinroombuttonform");
jrbform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    loadjoinroom();

    jrbform.reset();
});

var crform;

function loadcreateroom() {
    cont.innerHTML = '<form id = "createroomform"><input type = "text", id = "roomnameinput", name = "roomnameinput", placeholder = "Room code", required, autocomplete = "off", size = "30px"/><input type = "submit", id = "cr", name = "button", value = "Create Room", required/></form>'

    crform = document.getElementById("createroomform");
    crform.addEventListener("submit", (e) => {
        var joinCode = String(document.forms["createroomform"]["roomnameinput"].value);
        if ((joinCode.length > 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            get(child(ref(database), `chats/${joinCode}`)).then((snapshot) => {
                if (!snapshot.exists()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    loadchatroom(joinCode);
        
                    crform.reset();
                }
            });
            crform.reset();
        }
    });
}

var jrform;

function loadjoinroom() {
    cont.innerHTML = '<form id = "joinroomform"><input type = "text", id = "roomnameinput", name = "roomnameinput", placeholder = "Room code", required, autocomplete = "off", size = "30px"/><input type = "submit", id = "cr", name = "button", value = "Join Room", required/></form>'

    jrform = document.getElementById("joinroomform");
    jrform.addEventListener("submit", (e) => {
        var joinCode = String(document.forms["joinroomform"]["roomnameinput"].value);
        if ((joinCode.length > 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            get(child(ref(database), `chats/${joinCode}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    loadchatroom(joinCode);
        
                    jrform.reset();
                }
            });
            jrform.reset();
        }
    });
}

var nd;
var cd;
var chat;
var smf;
var nick = "Anonymous User";
var send;
var chatRef;
var today;
var options;
var smform;
var ncform;
var focused;
var icon = document.getElementById("icon");

function loadchatroom(chatName) {
    cont.innerHTML = '<p id = "chat"><b>Please note that you will not be able to see messages sent before the tab was opened. It is recommended to keep this tab running in the background, if you do not wish to miss out.</b></p><form id = "sendmessageform"><input type = "text", id = "sendmessage", name = "sendmessage", placeholder = "Message here...", required, autocomplete = "off"><input type = "submit", id = "smbutton", name = "button", value = "Send Message", required></form><form id = "changenickform"><input type = "text", id = "changenick", name = "changenick", placeholder = "Set nickname...", required, autocomplete = "off"><input type = "submit", id = "cnbutton", name = "button", value = "Set Nickname", required></form><p id = "nickdisplay">Current Nickname: <b>Anonymous User</b></p><p id = "codedisplay"></p>';

    nd = document.getElementById("nickdisplay");
    cd = document.getElementById("codedisplay");
    chat = document.getElementById("chat");
    
    smform = document.getElementById("sendmessageform");
    smform.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        smf = String(document.forms["sendmessageform"]["sendmessage"].value);
        today  = new Date();
        options = { weekday: undefined, year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric", second: "numeric" };
        send = today.toLocaleDateString("en-US", options) + " <b>" + nick + ":</b> " + smf;
        set(chatRef, {
            recentMessage: send
        });
        smform.reset();
    });

    ncform = document.getElementById("changenickform");
    ncform.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        nick = String(document.forms["changenickform"]["changenick"].value);
        nd.innerHTML = "Current Nickname: <b>" + nick + "</b>";
        ncform.reset();
    });

    cd.innerHTML = "Room code: <b>" + chatName + "</b>";

    init(chatName);
}

function init(chatName) {
    
    onAuthStateChanged(auth, (user) => {
        if (user) {

            chatRef = ref(database, `chats/${chatName}`);

            // callback will occur whenever player ref changes
            onValue(chatRef, (snapshot) => {
                for (var key in (snapshot.val() || {})) {
                    chat.innerHTML += "<br></br>" + snapshot.val()[key];
                    if (!focused) {
                        icon.href = "kijetesantakalu_notif.png";
                    }
                }
                // for (var key in (snapshot.val() || {})) {
                //     gamePlayers[key].name = snapshot.val()[key].name;
                //     gamePlayers[key].x = snapshot.val()[key].x;
                //     gamePlayers[key].y = snapshot.val()[key].y;
                // }
            });
        
            // callback will occur whenever (relative to the client) a new player joins
            // (this means even if people were playing before a new client joins, to the client the other people will have just joined and this function will fire for all of them)
            onChildAdded(chatRef, (snapshot) => {
                // var addedPlayer = snapshot.val();
        
                // if (addedPlayer.id === playerID) {
                //     gamePlayer = new Player(addedPlayer.name, addedPlayer.x, addedPlayer.y, true);
                //     gamePlayers[addedPlayer.id] = gamePlayer;
                // } else {
                //     var p = new Player(addedPlayer.name, addedPlayer.x, addedPlayer.y, false);
                //     gamePlayers[addedPlayer.id] = p;
                // }
            });
        
            onChildRemoved(chatRef, (snapshot) => {
                // delete(gamePlayers[snapshot.val().id]);
            })
        } else {
            // logged out
        }
    });

    signInAnonymously(auth).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        
        console.log(errorCode, errorMessage);
    });
}

var tcss = document.getElementById("themecss");
var tsform = document.getElementById("themeselectform");
var ts = document.getElementById("themeselect");
tsform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (ts.options[ts.selectedIndex].text == "Light Mode") {
        tcss.href = "theme_light.css";
    } else if (ts.options[ts.selectedIndex].text == "Dark Mode") {
        tcss.href = "theme_dark.css";
    }
});

var fcss = document.getElementById("fontcss");
var fsform = document.getElementById("fontselectform");
var fs = document.getElementById("fontselect");
fsform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (fs.options[fs.selectedIndex].text == "Arial") {
        fcss.href = "font_arial.css";
    } else if (fs.options[fs.selectedIndex].text == "Times New Roman") {
        fcss.href = "font_tnr.css";
    } else if (fs.options[fs.selectedIndex].text == "Comic Sans MS") {
        fcss.href = "font_csms.css";
    }
});

window.onfocus = function () {
    focused = true;
    icon.href = "kijetesantakalu.png";
};

window.onblur = function () {
    focused = false;
};