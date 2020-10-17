// Se importan las dependencias y los archivos a utilizarse
import 'bootstrap';
import '../scss/styles.scss';
import * as firebase from 'firebase/app';
import "firebase/auth";

// Variable de configuracion de firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    databaseURL: process.env.FIREBASE_DATABASEURL,
    projectId: process.env.FIREBASE_PROJECTID,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
    appId: process.env.FIREBASE_APPID,
    measurementId: process.env.FIREBASE_MEASUREMENTID
};

// Variables globales para el login
let emailInput;
let passwordInput;

// Se inicializa la plataforma de firebase en el proyecto
firebase.initializeApp(firebaseConfig)

// Se exoprta la variable de firebase
export const firebaseApp = firebase;

$(document).ready(function () {
    emailInput = document.getElementById('emailInput');
    passwordInput = document.getElementById('passwordInput');

    // Evento que se ejecuta cuando el usuario hace 'click' en el boton de 'Iniciar Sesion'
    $('#loginButton').click(iniciarSesion);

    // Se establece la persisetencia de autenticacion por SESSION unicamente
    firebase.app().auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function () {
        console.log("Persistencia de autenticacion establecida correctamente.");
    });
})

// Metodo que se ejecuta para iniciar sesion
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

// Metodo para validar los inputs de email y pasword
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
