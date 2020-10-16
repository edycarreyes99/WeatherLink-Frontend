import 'bootstrap';
import '../scss/styles.scss';
import * as firebase from 'firebase/app';
import "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDp4JkqzG6unM2B-KlVlLDsnKadbcIPdhg",
    authDomain: "weatherlink.firebaseapp.com",
    databaseURL: "https://weatherlink.firebaseio.com",
    projectId: "weatherlink",
    storageBucket: "weatherlink.appspot.com",
    messagingSenderId: "410964094250",
    appId: "1:410964094250:web:af25beeec5f42f75e74253",
    measurementId: "G-XVG5XE2LGV"
};

let emailInput;
let passwordInput;

firebase.initializeApp(firebaseConfig)

export const firebaseApp = firebase;

$(document).ready(function () {
    emailInput = document.getElementById('emailInput');
    passwordInput = document.getElementById('passwordInput');
    $('#loginButton').click(iniciarSesion);
    firebase.app().auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function () {
        console.log("Persistencia establecida correctamente.");
    });
})

function iniciarSesion() {
    console.log("Iniciando sesion");
    if (validarInputs) {
        const promise = firebase.app().auth().signInWithEmailAndPassword(emailInput.value.toString(), passwordInput.value.toString());
        promise.then(user => {
            alert(`¡Bienvenido ${user.user.email}!`)
            location.replace('/dashboard.html');
        });
        promise.catch(error => {
            console.error(error.code + ": " + error.message);
            switch (error.code) {
                case 'auth/wrong-password':
                    alert("La contraseña no es válida o el usuario no tiene contraseña.")
                    break;
                case "auth/invalid-email":
                    alert("El email no es correcto o esta mal formateado.");
                    break;
            }
        });
    }
}

function validarInputs() {

    if (emailInput.value.toString().trim() === '' || passwordInput.value.toString().trim() === '') {
        alert("El email y/o la contraseña no pueden estar en blanco.");
        return false;
    } else if (passwordInput.value.toString().length < 6) {
        alert("La contraseña no puede tener menos de 6 caracteres.");
        return false;
    }

    return true;
}
