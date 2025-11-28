import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, DollarSign, Wallet, CheckCircle, AlertCircle, Users, Bus, MapPin, Ticket, BookOpen, Cloud, Save, Lock, LogIn, ShieldCheck, X, Eye, Filter, Ban, ArrowRightLeft, User, Bell, Check, Trash2, Phone, FileText, PhoneCall, Hash, Edit3 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, getDoc } from 'firebase/firestore';

// --- Configuración de Firebase ---
// NOTA PARA DEPLOY REAL: Reemplaza esto con tu propia configuración de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA5PQR36r_fHNn6RRIKcVJm5Cu60lKYk8o",
  authDomain: "fil25-54c70.firebaseapp.com",
  projectId: "fil25-54c70",
  storageBucket: "fil25-54c70.firebasestorage.app",
  messagingSenderId: "1078287848858",
  appId: "1:1078287848858:web:2b32f36da8fbd15bdb5623",
  measurementId: "G-231S3DYW3M"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- CONFIGURACIÓN DE CUENTAS DE COORDINADORES ---
const COORDINATORS = {
  'admin':   { pass: 'fil2025', name: 'Coord. General', busId: 'all', color: 'bg-slate-900' },
  'camion2': { pass: 'ruta2',   name: 'Aylin R. Ramos', busId: 2, color: 'bg-blue-600' }, 
  '221003476': { pass: 'ruta3',   name: 'Iker S. Soltero', busId: 3, color: 'bg-purple-600' },
  '223440784': { pass: 'samumv367', name: 'Samuel Mendez', busId: 1, color: 'bg-orange-600' }
};

const PaymentList = () => {
  // Estados de Admin y Modales
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminAuthBusId, setAdminAuthBusId] = useState('all');
  const [adminName, setAdminName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Nuevo Estado: Modal de Edición y Datos del Formulario
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados de Permuta
  const [swapId1, setSwapId1] = useState('');
  const [swapId2, setSwapId2] = useState('');
  const [swapMessage, setSwapMessage] = useState('');
  const [swapError, setSwapError] = useState('');
  
  // Login Inputs
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados App
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentBusFilter, setCurrentBusFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const COSTO_TOTAL = 480;

  // --- DATOS REALES (LISTA MAESTRA DEFINITIVA) ---
  const initialUsersSeed = [
    // --- COORDINADORES (Folios 1-3) ---
    { id: 1, name: "Samuel Méndez Vidrio", role: "Coordinador", payment: 0, color: "bg-orange-500", busId: 1, phone: '', studentCode: '' },
    { id: 2, name: "Aylin Roberta Ramos Mejia", role: "Coordinador", payment: 0, color: "bg-blue-500", busId: 2, phone: '', studentCode: '' },
    { id: 3, name: "Iker Steve Soltero Rodriguez", role: "Coordinador", payment: 0, color: "bg-purple-500", busId: 3, phone: '', studentCode: '' },

    // --- CAMIÓN 1 (Folios 004 - 041) ---
    { id: 4, name: "Joseph Yancarlo Avalos Canales", role: "Estudiante", payment: 480, phone: "3171325247", studentCode: "225519213", color: "bg-emerald-500", busId: 1, ssn: "5251056577", parent: "Lenis Alejandra Canales Castro", parentPhone: "3171048798" },
    { id: 5, name: "Daira Athziri Saldaña Dávila", role: "Estudiante", payment: 480, phone: "3171284644", studentCode: "225521072", color: "bg-emerald-500", busId: 1, ssn: "4927321887", parent: "María Luisa Dávila Muñoz", parentPhone: "3171146753" },
    { id: 6, name: "Fernanda Saraly Garcia Lopez", role: "Estudiante", payment: 300, phone: "3171284644", studentCode: "225517318", color: "bg-emerald-500", busId: 1, ssn: "4109019556", parent: "Rosario Guadalupe López Guerrero", parentPhone: "3171046130" },
    { id: 7, name: "Axel Yael Anguiano Ramirez", role: "Estudiante", payment: 480, phone: "3171089872", studentCode: "225517423", color: "bg-emerald-500", busId: 1, ssn: "52241073510", parent: "Isaura Ramírez Cortes", parentPhone: "3173875541" },
    { id: 8, name: "Danniel Santiago Martinez Mendoza", role: "Estudiante", payment: 480, phone: "3171051172", studentCode: "225517431", color: "bg-emerald-500", busId: 1, ssn: "45058351331", parent: "Daniela Guadalupe Mendoza Casillas", parentPhone: "3171064715" },
    { id: 9, name: "Karla Joselyn Delgadillo Lizaola", role: "Estudiante", payment: 480, phone: "3178731763", studentCode: "223440318", color: "bg-emerald-500", busId: 1, ssn: "60230824843", parent: "Sergio Emanuel Garibaldo Delgadillo", parentPhone: "3171285349" },
    { id: 10, name: "Jose Armando Mejia Capacete", role: "Estudiante", payment: 480, phone: "3326321025", studentCode: "224080293", color: "bg-emerald-500", busId: 1, ssn: "N/A", parent: "Maria Elena Capacete Chavez", parentPhone: "3171066215" },
    { id: 11, name: "Kamila Zohemi Soto Ramos", role: "Estudiante", payment: 300, phone: "3171002497", studentCode: "224079929", color: "bg-emerald-500", busId: 1, ssn: "19230886418", parent: "Iliana arina Ramos Dávila", parentPhone: "3173831730" },
    { id: 12, name: "Estefania Vazquez Naranjo", role: "Estudiante", payment: 480, phone: "3171047713", studentCode: "224079546", color: "bg-emerald-500", busId: 1 },
    { id: 13, name: "Jose de Jesús Orozco Garcia", role: "Estudiante", payment: 480, phone: "3171041595", studentCode: "N/A", color: "bg-emerald-500", busId: 1, ssn: "4038697407", parent: "Karla Gisela Garcia Flores", parentPhone: "3171231595" },
    { id: 14, name: "Sofia Guadalupe Delgadillo Barbosa", role: "Estudiante", payment: 480, phone: "3173895711", studentCode: "225517784", color: "bg-emerald-500", busId: 1, ssn: "4967734775", parent: "Maria Guadalupe Barbosa Soltero", parentPhone: "3178735048" },
    { id: 15, name: "Brittany Celeste Ortega Aguilar", role: "Estudiante", payment: 480, phone: "3171078377", studentCode: "225079589", color: "bg-emerald-500", busId: 1, ssn: "3230814679", parent: "Maria Gabriela Aguilar Garcia", parentPhone: "3171281861" },
    { id: 16, name: "Britany Guadalupe Horta Fuentes", role: "Estudiante", payment: 300, phone: "3171213307", studentCode: "224082423", color: "bg-emerald-500", busId: 1, ssn: "58230870931", parent: "Juleitti Guadalupe Fuentes Bañuelos", parentPhone: "3171209722" },
    { id: 17, name: "Priscila Gomez Nuñes", role: "Estudiante", payment: 480, phone: "3171124221", studentCode: "224079775", color: "bg-emerald-500", busId: 1, ssn: "60230863734", parent: "Humberto Gomez Cisneros", parentPhone: "3173871279" },
    { id: 18, name: "Donovan Eduardo Borbon Michel", role: "Estudiante", payment: 300, phone: "3171082695", studentCode: "223443937", color: "bg-emerald-500", busId: 1, ssn: "2210867210", parent: "Hector Alejandro Borbon Torres", parentPhone: "3171203250" },
    { id: 19, name: "Andrei Alexander Cuellar Ponce", role: "Estudiante", payment: 480, phone: "3171050219", studentCode: "224079562", color: "bg-emerald-500", busId: 1, ssn: "19230868986", parent: "Alicia Abigail Ponce Ambriz", parentPhone: "3171074358" },
    { id: 20, name: "Edwin Javier Robles Torres", role: "Estudiante", payment: 340, phone: "3171126265", studentCode: "223443325", color: "bg-emerald-500", busId: 1, ssn: "N/A", parent: "Mariela Torres Pelayo", parentPhone: "3173873538" },
    { id: 21, name: "Vanessa Guzman Zarazua", role: "Estudiante", payment: 300, phone: "3171125243", studentCode: "223442213", color: "bg-emerald-500", busId: 1, ssn: "60230868287", parent: "German Guzman Sanchez", parentPhone: "3171078068" },
    { id: 22, name: "Kimberly Lorena Gutierrez Tovar", role: "Estudiante", payment: 300, phone: "3171094446", studentCode: "223441101", color: "bg-emerald-500", busId: 1, ssn: "19230891814", parent: "Dalia Morayma Tovar Iglesias", parentPhone: "3171121633" },
    { id: 23, name: "Melanie Kamila Diaz Rios", role: "Estudiante", payment: 300, phone: "3173833120", studentCode: "224079279", color: "bg-emerald-500", busId: 1, ssn: "404863075", parent: "Max Fernando Diaz Medina", parentPhone: "3171035612" },
    { id: 24, name: "Jonathan Victor Hugo Lopez Montaño", role: "Estudiante", payment: 300, phone: "3171296534", studentCode: "224080765", color: "bg-emerald-500", busId: 1, ssn: "3230829370", parent: "Marisol Montaño Ortega", parentPhone: "3171075014" },
    { id: 25, name: "Ariadna Martinez Martinez", role: "Estudiante", payment: 300, phone: "3171318301", studentCode: "223441926", color: "bg-emerald-500", busId: 1, ssn: "58230869834", parent: "Karla Janeth Martinez Castillo", parentPhone: "3171035583" },
    { id: 26, name: "Alfonso Hueso Vidrio", role: "Estudiante", payment: 300, phone: "3171361187", studentCode: "224082121", color: "bg-emerald-500", busId: 1, ssn: "5823086794", parent: "Ofelia Vidrio Guzman", parentPhone: "3173884314" },
    { id: 27, name: "Kevin Nahir Zamora Martinez", role: "Estudiante", payment: 480, phone: "3211134653", studentCode: "224429776", color: "bg-emerald-500", busId: 1, ssn: "17240998512", parent: "Silvestre Zamora Duran", parentPhone: "3173851523" },
    { id: 28, name: "Oscar Daniel Gomez Melendez", role: "Estudiante", payment: 480, phone: "3344335726", studentCode: "223441128", color: "bg-emerald-500", busId: 1, ssn: "19230895609", parent: "Daniel Gomez Carreño", parentPhone: "3171160665" },
    { id: 29, name: "Kenya Mariana Dominguez Ramos", role: "Estudiante", payment: 480, phone: "3171115887", studentCode: "223442884", color: "bg-emerald-500", busId: 1, ssn: "8392771293-1", parent: "Jose Luis Dominguez Ruiz", parentPhone: "3173883215" },
    { id: 30, name: "Brisa Guadalupe Guerrero Buenrostro", role: "Estudiante", payment: 480, phone: "3171111049", studentCode: "224429393", color: "bg-emerald-500", busId: 1, ssn: "18240990004", parent: "Luis Octavio Guerrero Rodriguez", parentPhone: "3171111049" },
    { id: 31, name: "Rosa Camila Garcia Caloca", role: "Estudiante", payment: 480, phone: "3171070658", studentCode: "552217385", color: "bg-emerald-500", busId: 1, ssn: "N/A", parent: "Maria del Rosario Garcia Caloca", parentPhone: "3173883392" },
    { id: 32, name: "Evelyn Marlen Ruiz Solano", role: "Estudiante", payment: 300, phone: "3171286183", studentCode: "224427625", color: "bg-emerald-500", busId: 1, ssn: "5240996602", parent: "Rosy Janeth Solano Rodriguez", parentPhone: "3171160255" },
    { id: 33, name: "Kevin Alfonso Perez Cardenas", role: "Estudiante", payment: 300, phone: "3171127866", studentCode: "224430057", color: "bg-emerald-500", busId: 1, ssn: "38250960770", parent: "Cesar Perez Oliva", parentPhone: "3171001456" },
    { id: 34, name: "Jazmin Elizabeth Savalza Gonzalez", role: "Estudiante", payment: 300, phone: "3171085894", studentCode: "224427544", color: "bg-emerald-500", busId: 1, ssn: "5240908011", parent: "Elisa Gonzalez Jimenez", parentPhone: "3171054594" },
    { id: 35, name: "Alexa Fernanda Maldonado Gutierrez", role: "Estudiante", payment: 300, phone: "3332527487", studentCode: "224429547", color: "bg-emerald-500", busId: 1, ssn: "17240976989", parent: "Claudia Yesenia Gutierrez Torres", parentPhone: "3411389939" },
    { id: 36, name: "Ana Yatziry Lopez Preciado", role: "Estudiante", payment: 300, phone: "3171132231", studentCode: "225200381", color: "bg-emerald-500", busId: 1, ssn: "3250990383", parent: "Karla Liliana Preciado Guzman", parentPhone: "3171118799" },
    { id: 37, name: "Angel Uriel Pelayo Gutierrez", role: "Estudiante", payment: 480, phone: "3171048425", studentCode: "224428079", color: "bg-emerald-500", busId: 1, ssn: "0325093452-2", parent: "Christian Ulises Pelayo Almanza", parentPhone: "3171011621" },
    { id: 38, name: "Alejandra Estefania Yañez Fernandez", role: "Estudiante", payment: 300, phone: "3171013245", studentCode: "224011964", color: "bg-emerald-500", busId: 1, ssn: "N/A", parent: "Mayra Yanuaria Fernandez Lopez", parentPhone: "3171219835" },
    { id: 39, name: "Christian Martin Ramirez Jimenez", role: "Estudiante", payment: 300, phone: "3171083416", studentCode: "223444171", color: "bg-emerald-500", busId: 1, ssn: "N/A", parent: "Esmeralda del Carmen Jimenez Lopez", parentPhone: "3171064911" },
    { id: 40, name: "Teresa Madeleine Garcia Viramontes", role: "Estudiante", payment: 480, phone: "3171059501", studentCode: "N/A", color: "bg-emerald-500", busId: 1, ssn: "5180386913", parent: "Everardo Garcia Rubalcaba", parentPhone: "3171436810" },
    { id: 41, name: "Luna Renata Sanchez Benitez", role: "Estudiante", payment: 480, phone: "3173882461", studentCode: "225520653", color: "bg-emerald-500", busId: 1, ssn: "3251039651", parent: "Adali Carolina Benitez Garcia", parentPhone: "3171203411" },

    // --- CAMIÓN 3 (Folios 042 - 085) ---
    { id: 42, name: "Akeimy Yeraldi Mancilla Isidro", role: "Pasajero", payment: 300, phone: "3171067689", color: "bg-purple-500", busId: 3 },
    { id: 43, name: "Kimberly Mileny Nolasco García", role: "Pasajero", payment: 480, phone: "3171131744", color: "bg-purple-500", busId: 3 },
    { id: 44, name: "Angeline Itzayana Terrones Chávez", role: "Pasajero", payment: 300, phone: "3171314860", color: "bg-purple-500", busId: 3 },
    { id: 45, name: "Ximena Alejandra Contreras Ponce", role: "Pasajero", payment: 300, phone: "3171238874", color: "bg-purple-500", busId: 3 },
    { id: 46, name: "Camila Dévora", role: "Pasajero", payment: 480, phone: "3339117462", color: "bg-purple-500", busId: 3 },
    { id: 47, name: "Dylan Gael Corona Méndez", role: "Pasajero", payment: 480, phone: "3173896894", color: "bg-purple-500", busId: 3 },
    { id: 48, name: "Helena García Martínez", role: "Pasajero", payment: 480, phone: "3171297602", color: "bg-purple-500", busId: 3 },
    { id: 49, name: "Sebastián García Martínez", role: "Pasajero", payment: 480, phone: "3171124602", color: "bg-purple-500", busId: 3 },
    { id: 50, name: "Dana Isabel Pérez Santana", role: "Pasajero", payment: 480, phone: "3411771355", color: "bg-purple-500", busId: 3 },
    { id: 51, name: "Miriam Judith Cisneros Reyes", role: "Pasajero", payment: 480, phone: "3173891418", color: "bg-purple-500", busId: 3 },
    { id: 52, name: "Jonathan Gálvez González", role: "Pasajero", payment: 300, phone: "3171043835", color: "bg-purple-500", busId: 3 },
    { id: 53, name: "Andrik Sánchez Pelayo", role: "Pasajero", payment: 300, phone: "3171049467", color: "bg-purple-500", busId: 3 },
    { id: 54, name: "Angélica Ariadna Gómez Moranchel", role: "Pasajero", payment: 300, phone: "3171072106", color: "bg-purple-500", busId: 3 },
    { id: 55, name: "Fátima Moreno de Jesús", role: "Pasajero", payment: 480, phone: "3171286643", color: "bg-purple-500", busId: 3 },
    { id: 56, name: "José Manuel Arreola Díaz", role: "Pasajero", payment: 480, phone: "3173872370", color: "bg-purple-500", busId: 3 },
    { id: 57, name: "Renata Luna Ureña", role: "Pasajero", payment: 480, phone: "3325109440", color: "bg-purple-500", busId: 3 },
    { id: 58, name: "Kenia Mariana Domínguez Ramos", role: "Pasajero", payment: 300, phone: "3171115887", color: "bg-purple-500", busId: 3 },
    { id: 59, name: "Christian Daniel Ruiz Saldaña", role: "Pasajero", payment: 480, phone: "3171205135", color: "bg-purple-500", busId: 3 },
    { id: 60, name: "Rubi Castellón Pérez", role: "Pasajero", payment: 480, phone: "3171093801", color: "bg-purple-500", busId: 3 },
    { id: 61, name: "Hanna Kareli Yamilet López Hernández", role: "Pasajero", payment: 480, phone: "3178731120", color: "bg-purple-500", busId: 3 },
    { id: 62, name: "Alondra María García Sánchez", role: "Pasajero", payment: 480, phone: "3171283147", color: "bg-purple-500", busId: 3 },
    { id: 63, name: "Astrid Martínez Beltrán", role: "Pasajero", payment: 480, phone: "3171058492", color: "bg-purple-500", busId: 3 },
    { id: 64, name: "Jesús López Campos", role: "Pasajero", payment: 480, phone: "3320190233", color: "bg-purple-500", busId: 3 },
    { id: 65, name: "Kimberly Fátima Rodríguez Trujillo", role: "Pasajero", payment: 480, phone: "3171066325", color: "bg-purple-500", busId: 3 },
    { id: 66, name: "Cristina Itzel Pérez Pérez", role: "Pasajero", payment: 480, phone: "3171205047", color: "bg-purple-500", busId: 3 },
    { id: 67, name: "Evelyn Yoselin Vázquez Ortega", role: "Pasajero", payment: 480, phone: "4491235827", color: "bg-purple-500", busId: 3 },
    { id: 68, name: "Selene Ruby Téllez Baltazar", role: "Pasajero", payment: 480, phone: "3317143526", color: "bg-purple-500", busId: 3 },
    { id: 69, name: "Edna Citlalli Reyna Ayala (P)", role: "Pasajero", payment: 480, phone: "3171318696", color: "bg-purple-500", busId: 3 },
    { id: 70, name: "Jorge Márquez Loera", role: "Pasajero", payment: 480, phone: "3171234031", color: "bg-purple-500", busId: 3 },
    { id: 71, name: "Lucio Isac Sandoval Quintero", role: "Pasajero", payment: 300, phone: "3171055683", color: "bg-purple-500", busId: 3 },
    { id: 72, name: "Darío Gómez Rivera", role: "Pasajero", payment: 480, phone: "3171215534", color: "bg-purple-500", busId: 3 },
    { id: 73, name: "Juan Pablo Rodríguez Pelayo", role: "Pasajero", payment: 480, phone: "3171318561", color: "bg-purple-500", busId: 3 },
    { id: 74, name: "Dante Sedano", role: "Pasajero", payment: 480, phone: "3171038271", color: "bg-purple-500", busId: 3 },
    { id: 75, name: "Osmar Alejandro Méndez Ibarra", role: "Pasajero", payment: 300, phone: "3173896781", color: "bg-purple-500", busId: 3 },
    { id: 76, name: "Baldwin Alexander Rodríguez Hernández", role: "Pasajero", payment: 480, phone: "3173886218", color: "bg-purple-500", busId: 3 },
    { id: 77, name: "Agustín Betunen Ramírez", role: "Pasajero", payment: 300, phone: "3314302671", color: "bg-purple-500", busId: 3 },
    { id: 78, name: "Camila Anahí Torres Montes", role: "Pasajero", payment: 300, phone: "3171283203", color: "bg-purple-500", busId: 3 },
    { id: 79, name: "Karol Gabriela Robles Uribe", role: "Pasajero", payment: 300, phone: "3171010251", color: "bg-purple-500", busId: 3 },
    { id: 80, name: "Nahomi Dayan Núñez Sánchez", role: "Pasajero", payment: 250, phone: "3178734986", color: "bg-purple-500", busId: 3 },
    { id: 81, name: "Milton Santiago López Guerrero", role: "Pasajero", payment: 300, phone: "3171070966", color: "bg-purple-500", busId: 3 },
    { id: 82, name: "Iliana Valentina Rodríguez", role: "Pasajero", payment: 300, phone: "3173851141", color: "bg-purple-500", busId: 3 },
    { id: 83, name: "Diego Alejandro Mancilla García", role: "Pasajero", payment: 300, phone: "3171128601", color: "bg-purple-500", busId: 3 },
    { id: 84, name: "Abner Enríquez Casillas", role: "Pasajero", payment: 300, phone: "+1 8185248474", color: "bg-purple-500", busId: 3 },
    { id: 85, name: "Paola Sánchez Soltero", role: "Pasajero", payment: 480, phone: "3171292143", color: "bg-purple-500", busId: 3 },
    
    // --- CAMIÓN 2 (Folios 086 - 129) - NUEVOS ---
    { id: 86, name: "Ian Raphael Aguilar Gonzales", role: "Pasajero", payment: 480, phone: "3171281276", color: "bg-blue-500", busId: 2 },
    { id: 87, name: "Joselin Liset Gómez Macías", role: "Pasajero", payment: 480, phone: "3171292705", color: "bg-blue-500", busId: 2, ssn: "19240969204", parent: "Jorge Armando Gómez Guzmán", parentPhone: "3411604229" },
    { id: 88, name: "Adrián Villafaña Navarro", role: "Pasajero", payment: 480, phone: "3171079620", color: "bg-blue-500", busId: 2 },
    { id: 89, name: "Hermione Elizabeth Gonzalez Villaseñor", role: "Pasajero", payment: 480, phone: "3171283727", color: "bg-blue-500", busId: 2 },
    { id: 90, name: "Miguel Ángel Vázquez Rosales", role: "Pasajero", payment: 480, phone: "3171067436", color: "bg-blue-500", busId: 2 },
    { id: 91, name: "Fatima Elizabet Rubio Galindo", role: "Pasajero", payment: 480, phone: "3171003776", color: "bg-blue-500", busId: 2, ssn: "4977509597", parent: "María del Rosario Galindo Gonzales", parentPhone: "3173873442" },
    { id: 92, name: "Leonardo Rubio Galindo", role: "Pasajero", payment: 480, phone: "3171127532", color: "bg-blue-500", busId: 2, ssn: "56230952204", parent: "Mario del Rosario Galindo", parentPhone: "3173873442" },
    { id: 93, name: "Ángela Valeria Guerra Cruz", role: "Pasajero", payment: 480, phone: "3171067907", color: "bg-blue-500", busId: 2, ssn: "54977910246", parent: "Alfredo Guerra Carrizales", parentPhone: "3173817075" },
    { id: 94, name: "Paulina Gómez Delgadillo", role: "Pasajero", payment: 240, phone: "3171287000", color: "bg-blue-500", busId: 2 },
    { id: 95, name: "Karen Elizabeth Guitron Contreras", role: "Pasajero", payment: 480, phone: "3171198085", color: "bg-blue-500", busId: 2, ssn: "2187056607", parent: "Miriam Yaritzha Guitron Contreras", parentPhone: "3411233286" },
    { id: 96, name: "Andrea Navarro Tapia", role: "Pasajero", payment: 480, phone: "3334866670", color: "bg-blue-500", busId: 2 },
    { id: 97, name: "Stephanie Victoria Reyes Cabrera", role: "Pasajero", payment: 480, phone: "3171286611", color: "bg-blue-500", busId: 2 },
    { id: 98, name: "Jesús Alejandro González Michel", role: "Pasajero", payment: 480, phone: "3171316508", color: "bg-blue-500", busId: 2 },
    { id: 99, name: "Gabriela Lizbeth Guzmán López", role: "Pasajero", payment: 480, phone: "3171136149", color: "bg-blue-500", busId: 2, ssn: "67040811794", parent: "Lizbeth López Cabrera", parentPhone: "3171055052" },
    { id: 100, name: "Maximiliano Pérez Reynaga", role: "Pasajero", payment: 480, phone: "3171003536", color: "bg-blue-500", busId: 2, ssn: "4987665116", parent: "Guadalupe Reynaga", parentPhone: "3171092056" },
    { id: 101, name: "Aarón Santiago Monico Ornelas", role: "Pasajero", payment: 480, phone: "3171197987", color: "bg-blue-500", busId: 2, ssn: "18240900110", parent: "Fatima Noemí Ornelas Ahumada", parentPhone: "3171088059" },
    { id: 102, name: "Litzy Estrella Lepe Guitron", role: "Pasajero", payment: 480, phone: "3171290211", color: "bg-blue-500", busId: 2, ssn: "10210785217", parent: "Teresa Maria Guitron Castellón", parentPhone: "3171000220" },
    { id: 103, name: "Omar Aldair Flores Aceves", role: "Pasajero", payment: 480, phone: "3151255759", color: "bg-blue-500", busId: 2, ssn: "4088304284", parent: "Óscar Omar Flores cuevas", parentPhone: "3151089743" },
    { id: 104, name: "Fanny Guzmán Gonzales", role: "Pasajero", payment: 480, phone: "3173819207", color: "bg-blue-500", busId: 2 },
    { id: 105, name: "Oscar Rolando Villa Rentería", role: "Pasajero", payment: 300, phone: "3171295133", color: "bg-blue-500", busId: 2 },
    { id: 106, name: "Axel Fernando Álvarez Zavalza", role: "Pasajero", payment: 480, phone: "3171315998", color: "bg-blue-500", busId: 2 },
    { id: 107, name: "Carlos Monico Solórzano", role: "Pasajero", payment: 480, phone: "3171008827", color: "bg-blue-500", busId: 2 },
    { id: 108, name: "Adilene Saraí Villafaña Gonzales", role: "Pasajero", payment: 480, phone: "3171068710", color: "bg-blue-500", busId: 2 },
    { id: 109, name: "Ángel Rubalcava Vivar", role: "Pasajero", payment: 250, phone: "3171064361", color: "bg-blue-500", busId: 2 },
    { id: 110, name: "Román Uriel García Viramontes", role: "Pasajero", payment: 480, phone: "3171125947", color: "bg-blue-500", busId: 2, parent: "María Guadalupe Viramontes", parentPhone: "3173814171" },
    { id: 111, name: "Dianne Paola Díaz Cisneros", role: "Pasajero", payment: 480, phone: "3173872344", color: "bg-blue-500", busId: 2 },
    { id: 112, name: "Camila Guadalupe González Guitierrez", role: "Pasajero", payment: 480, phone: "3171204323", color: "bg-blue-500", busId: 2, ssn: "19240990259", parent: "Griselda Guitierrez Palomo", parentPhone: "3171192132" },
    { id: 113, name: "Maria Fernanda Pérez Robles", role: "Pasajero", payment: 480, phone: "3171317395", color: "bg-blue-500", busId: 2, ssn: "44149379289", parent: "Fatima robles Rodríguez", parentPhone: "3171003708" },
    { id: 114, name: "Kristal Marisol Elias Lepe", role: "Pasajero", payment: 480, phone: "3339796853", color: "bg-blue-500", busId: 2, ssn: "4998402186", parent: "Irene Lepe Aguilar", parentPhone: "3171019550" },
    { id: 115, name: "Daffne Estefanía Ávalos Arechiga", role: "Pasajero", payment: 480, phone: "3171046386", color: "bg-blue-500", busId: 2, ssn: "8240951854", parent: "Claudia Elizabeth Arechiga flores", parentPhone: "3171212031" },
    { id: 116, name: "Maria Guadalupe Rodriguez Lopez Jimenez", role: "Pasajero", payment: 480, phone: "3171057800", color: "bg-blue-500", busId: 2, ssn: "5230876848", parent: "Ismael Rodríguez Canal", parentPhone: "3171080746" },
    { id: 117, name: "Danilo Agustin Castillo Diaz", role: "Pasajero", payment: 480, phone: "3171063803", color: "bg-blue-500", busId: 2, ssn: "59230805893", parent: "Karen Lizbeth Diaz Brambila", parentPhone: "3171168107" },
    { id: 118, name: "Diego Alberto Ruiz Nava", role: "Pasajero", payment: 480, phone: "3171135386", color: "bg-blue-500", busId: 2, parent: "Lucia Nava Carvajal", parentPhone: "3171056291" },
    { id: 119, name: "Diego Alejandro Garay De Alba", role: "Pasajero", payment: 480, phone: "3171085213", color: "bg-blue-500", busId: 2 },
    { id: 120, name: "Esmeralda González Gómez", role: "Pasajero", payment: 480, phone: "3178736049", color: "bg-blue-500", busId: 2 },
    { id: 121, name: "Alison Naomi Rodriguez Alvarez", role: "Pasajero", payment: 480, phone: "3171080060", color: "bg-blue-500", busId: 2, ssn: "19230895476", parent: "Héctor Rodríguez Contreras", parentPhone: "3173881547" },
    { id: 122, name: "Regina Guzmán Gonzales", role: "Pasajero", payment: 480, phone: "3171233583", color: "bg-blue-500", busId: 2 },
    { id: 123, name: "Jatzi Guadalupe Chávez Duque", role: "Pasajero", payment: 480, phone: "3171192342", color: "bg-blue-500", busId: 2 },
    { id: 124, name: "Carlos Daniel Franco Melendez", role: "Pasajero", payment: 480, phone: "3171013724", color: "bg-blue-500", busId: 2 },
    { id: 125, name: "Blanca Stephanie Grajeda Gil", role: "Pasajero", payment: 240, phone: "3171096724", color: "bg-blue-500", busId: 2 },
    { id: 126, name: "Aleck Dominic Rodriguez Santana", role: "Pasajero", payment: 480, phone: "3171093374", color: "bg-blue-500", busId: 2, ssn: "56977726241", parent: "Lizeth Azucena Santana Montes", parentPhone: "3171091313" },
    { id: 127, name: "Andrea Yamilet Salazar Ramírez", role: "Pasajero", payment: 300, phone: "3171087227", color: "bg-blue-500", busId: 2, ssn: "19230728099", parent: "Juana Patricia Ramírez Michel", parentPhone: "3171045431" },
    { id: 128, name: "Carlos Manuel García García", role: "Pasajero", payment: 480, phone: "3171002102", color: "bg-blue-500", busId: 2, ssn: "5240987114", parent: "Lorena García Covarrubias", parentPhone: "3411179493" },
    { id: 129, name: "Dulce Elizabeth Arreola López", role: "Pasajero", payment: 480, phone: "3171234067", color: "bg-blue-500", busId: 2, ssn: "3230886081", parent: "Nora López García", parentPhone: "3171118083" },
  ];
  
  // 1. Inicialización Auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sincronización Firestore (Usuarios y Solicitudes)
  useEffect(() => {
    if (!currentUser) return;
    
    // --- USO DE COLECCIÓN v15 (Versión con Bus 2 completo) ---
    const passengersCollectionPath = collection(db, 'artifacts', appId, 'public', 'data', 'fil_passengers_v15'); 
    const requestsCollectionPath = collection(db, 'artifacts', appId, 'public', 'data', 'fil_swap_requests_v15');

    // Sync Usuarios
    const unsubUsers = onSnapshot(passengersCollectionPath, async (snapshot) => {
      if (snapshot.empty || snapshot.docs.length < initialUsersSeed.length) {
        setLoading(true);
        const batchPromises = initialUsersSeed.map(user => 
          setDoc(doc(passengersCollectionPath, user.id.toString()), user)
        );
        await Promise.all(batchPromises);
        
        snapshot.docs.forEach(async (d) => {
             const id = parseInt(d.id);
             if (id > initialUsersSeed.length) { 
                 await deleteDoc(doc(passengersCollectionPath, d.id));
             }
        });

        const loadedUsers = initialUsersSeed; 
        loadedUsers.sort((a, b) => a.id - b.id);
        setUsers(loadedUsers);
        setLoading(false);
      } else {
        const loadedUsers = snapshot.docs.map(doc => doc.data());
        loadedUsers.sort((a, b) => a.id - b.id);
        setUsers(loadedUsers);
        setLoading(false);
      }
    });

    // Sync Solicitudes de Permuta
    const unsubRequests = onSnapshot(requestsCollectionPath, (snapshot) => {
      const loadedRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(loadedRequests);
    });

    return () => {
      unsubUsers();
      unsubRequests();
    };
  }, [currentUser]);

  // Manejo de Login
  const handleAppLogin = (e) => {
    e.preventDefault();
    let coordinator = null;
    if (loginUser === '223440784' && loginPass === 'samumv367') {
        coordinator = COORDINATORS['223440784'];
    } else {
        coordinator = COORDINATORS[loginUser];
    }
    
    if (coordinator && coordinator.pass === loginPass) {
      setIsAdminMode(true);
      setAdminAuthBusId(coordinator.busId);
      setCurrentBusFilter(coordinator.busId === 'all' ? 'all' : coordinator.busId);
      setAdminName(coordinator.name);
      setShowLoginModal(false);
      setLoginError('');
      setLoginUser('');
      setLoginPass('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    setAdminAuthBusId('all');
    setAdminName('');
    setCurrentBusFilter('all');
    setShowNotifications(false);
    setSelectedStudent(null);
    setEditFormData({});
    setIsEditing(false);
  };

  const handlePaymentChange = async (id, amount) => {
    if (!currentUser || !isAdminMode) return;
    setSaving(true);
    const value = Math.max(0, Number(amount));
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'fil_passengers_v15', id.toString());
      await updateDoc(docRef, { payment: value });
    } catch (e) {
      console.error("Error guardando:", e);
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  // --- CLICK EN USUARIO (VER/EDITAR DETALLES) ---
  const handleUserClick = (user) => {
      if (user.role === "Coordinador") return; 
      if (!isAdminMode) {
          alert("🔒 Acceso restringido. Inicia sesión como coordinador para ver los datos personales.");
          return;
      }
      setSelectedStudent(user);
      setEditFormData({ ...user });
      setIsEditing(false);
  };

  const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setEditFormData(prev => ({ ...prev, [name]: value }));
      setIsEditing(true);
  };

  const handleSaveChanges = async () => {
      if (!selectedStudent || !isAdminMode) return;
      setSaving(true);
      try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'fil_passengers_v15', selectedStudent.id.toString());
          
          const updatedData = { ...editFormData };
          if (updatedData.busId) updatedData.busId = Number(updatedData.busId);
          if (updatedData.payment) updatedData.payment = Number(updatedData.payment);
          
          if (updatedData.busId === 1) updatedData.color = "bg-emerald-500";
          if (updatedData.busId === 2) updatedData.color = "bg-blue-500";
          if (updatedData.busId === 3) updatedData.color = "bg-purple-500";

          await updateDoc(docRef, updatedData);
          setSelectedStudent(updatedData);
          setIsEditing(false);
      } catch (e) {
          console.error("Error al guardar:", e);
          alert("Error al guardar los cambios.");
      } finally {
          setTimeout(() => setSaving(false), 500);
      }
  };

  // ... (Lógica de Permutas y Aprobaciones sin cambios) ...
  const getSwapCandidates = () => {
    const id1 = parseInt(swapId1, 10);
    const id2 = parseInt(swapId2, 10);
    if (isNaN(id1) || isNaN(id2)) return { u1: null, u2: null, error: null };
    const u1 = users.find(u => u.id === id1);
    const u2 = users.find(u => u.id === id2);
    if (!u1 || !u2) return { u1, u2, error: 'Folio no encontrado.' };
    if (u1.id === u2.id) return { u1, u2, error: 'Mismo folio.' };
    return { u1, u2, error: null };
  };

  const initiateSwap = async () => {
    setSwapError('');
    const { u1, u2, error } = getSwapCandidates();
    if (error || !u1 || !u2) { setSwapError(error || "Datos incompletos"); return; }
    const canManageU1 = adminAuthBusId === 'all' || adminAuthBusId === u1.busId;
    const canManageU2 = adminAuthBusId === 'all' || adminAuthBusId === u2.busId;
    if (!canManageU1 && !canManageU2) { setSwapError("No tienes permiso."); return; }
    setSaving(true);
    const isDirectSwap = adminAuthBusId === 'all' || (u1.busId === u2.busId && u1.busId === adminAuthBusId);

    if (isDirectSwap) {
        try {
            const docRef1 = doc(db, 'artifacts', appId, 'public', 'data', 'fil_passengers_v15', u1.id.toString());
            const docRef2 = doc(db, 'artifacts', appId, 'public', 'data', 'fil_passengers_v15', u2.id.toString());
            await updateDoc(docRef1, { busId: u2.busId });
            await updateDoc(docRef2, { busId: u1.busId });
            setSwapMessage(`¡Cambio realizado!`);
            setTimeout(() => { setSwapMessage(''); setShowSwapModal(false); }, 2000);
        } catch (e) { setSwapError("Error al ejecutar."); }
    } else {
        try {
            const requestsRef = collection(db, 'artifacts', appId, 'public', 'data', 'fil_swap_requests_v15');
            const targetBusId = (adminAuthBusId === u1.busId) ? u2.busId : u1.busId;
            await addDoc(requestsRef, { requesterName: adminName, requesterBus: adminAuthBusId, targetBus: targetBusId, u1, u2, timestamp: new Date().toISOString(), status: 'pending' });
            setSwapMessage(`Solicitud enviada al Encargado C${targetBusId}`);
            setTimeout(() => { setSwapMessage(''); setShowSwapModal(false); }, 2000);
        } catch (e) { setSwapError("Error al enviar solicitud."); }
    }
    setTimeout(() => setSaving(false), 500);
  };

  const handleAcceptRequest = async (req) => {
      setSaving(true);
      try {
          const docRef1 = doc(db, 'artifacts', appId, 'public', 'data', 'fil_passengers_v15', req.u1.id.toString());
          const docRef2 = doc(db, 'artifacts', appId, 'public', 'data', 'fil_passengers_v15', req.u2.id.toString());
          await updateDoc(docRef1, { busId: req.u2.busId });
          await updateDoc(docRef2, { busId: req.u1.busId });
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'fil_swap_requests_v15', req.id));
      } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleRejectRequest = async (reqId) => {
      try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'fil_swap_requests_v15', reqId)); } catch (e) { console.error(e); }
  };

  // --- CALCULOS Y RENDERS ---
  const getUsersForStats = () => users.filter(user => user.role !== "Coordinador" && (currentBusFilter === 'all' || user.busId === Number(currentBusFilter)));
  const getFilteredUsers = () => {
    let result = users;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(user => user.name.toLowerCase().includes(lower) || user.id.toString().includes(lower));
    }
    if (currentBusFilter !== 'all') result = result.filter(user => user.busId === Number(currentBusFilter));
    return result;
  };

  const filteredUsers = getFilteredUsers();
  const statsUsers = getUsersForStats();
  const pendingRequests = requests.filter(r => adminAuthBusId === 'all' || r.targetBus === adminAuthBusId);

  const getPaymentStatus = (amount) => {
    if (amount >= COSTO_TOTAL) return { color: 'text-green-600 bg-green-50 border-green-200', label: 'Pagado', icon: CheckCircle };
    if (amount > 0) return { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Anticipo', icon: AlertCircle };
    return { color: 'text-red-600 bg-red-50 border-red-200', label: 'Sin Pago', icon: Wallet };
  };

  const calculateTotal = (list) => list.reduce((acc, user) => acc + Number(user.payment || 0), 0);
  const stats = {
    recaudado: calculateTotal(statsUsers),
    pagados: statsUsers.filter(u => u.payment >= COSTO_TOTAL).length,
    parciales: statsUsers.filter(u => u.payment > 0 && u.payment < COSTO_TOTAL).length,
    pendientes: statsUsers.filter(u => u.payment === 0).length,
    label: currentBusFilter === 'all' ? 'Total Global' : `Total Camión ${currentBusFilter}`
  };

  // --- RENDERERS ---
  const UserAvatar = ({ user, size = 'lg' }) => {
    const isFIL = user.id <= 3; 
    const borderColor = isFIL ? 'border-orange-600' : user.color.replace('bg-', 'border-');
    const textColor = isFIL ? 'text-orange-600' : user.color.replace('bg-', 'text-').replace('500', '600');
    return (
      <div className={`${size==='lg'?'w-12 h-12':'w-8 h-8'} border-2 rounded-full flex items-center justify-center bg-white ${borderColor} shadow-sm overflow-hidden shrink-0 relative`}>
        <div className={`flex flex-col items-center justify-center ${textColor}`}>
          <BookOpen className={size==='lg'?'w-5 h-5':'w-3 h-3'} />
          <span className={`${size==='lg'?'text-[0.5rem]':'text-[0.35rem]'} font-black leading-none mt-0.5`}>FIL 25</span>
        </div>
        <div className="absolute bottom-0 right-0 bg-slate-800 text-white text-[0.5rem] px-1 rounded-tl-md font-bold">C{user.busId}</div>
      </div>
    );
  };

  const PaymentInput = ({ user }) => {
    const isCoordinator = user.role === "Coordinador";
    const canEdit = isAdminMode && (adminAuthBusId === 'all' || adminAuthBusId === user.busId);
    if (isCoordinator) return <div className="flex items-center gap-2 h-9"><span className="text-slate-400 font-medium italic">— N/A —</span></div>;
    if (!isAdminMode) return <div className="flex items-center gap-2 h-9"><span className="text-slate-400 text-sm font-medium">$</span><span className={`text-lg font-bold ${user.payment >= COSTO_TOTAL ? 'text-green-600' : user.payment > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{user.payment || 0}</span><span className="text-xs text-slate-400 ml-1">MXN</span></div>;
    if (!canEdit) return <div className="flex items-center gap-2 h-9 opacity-60"><Ban className="w-4 h-4 text-slate-400" /><span className="text-slate-500 font-bold">${user.payment || 0}</span></div>;

    return (
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
          <input type="number" value={user.payment || ''} onChange={(e) => handlePaymentChange(user.id, e.target.value)} className={`block w-full pl-7 pr-12 py-2 sm:text-sm rounded-md border-2 focus:ring-0 focus:outline-none transition-colors ${user.payment >= COSTO_TOTAL ? 'border-green-300 bg-green-50/30 text-green-700' : user.payment > 0 ? 'border-amber-300 bg-amber-50/30 text-amber-700' : 'border-red-300 bg-red-50/30 text-red-700'}`} placeholder="0" />
        </div>
        <div className="flex gap-1">
           <button onClick={() => handlePaymentChange(user.id, 300)} className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 font-medium">$300</button>
           <button onClick={() => handlePaymentChange(user.id, 480)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium">$480</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-2 md:p-8 relative overflow-x-hidden">
      
      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="bg-orange-600 p-6 text-center relative">
                <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-orange-100 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2"><ShieldCheck className="w-5 h-5" /> Acceso Staff</h2>
             </div>
             <form onSubmit={handleAppLogin} className="p-6 space-y-4">
               <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario</label><input type="text" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" autoFocus /></div>
               <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label><input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" /></div>
               {loginError && <p className="text-red-500 text-xs flex items-center gap-1 font-medium bg-red-50 p-2 rounded"><AlertCircle className="w-3 h-3" /> {loginError}</p>}
               <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg">Entrar</button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES Y EDICIÓN */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedStudent(null)} />
            
            {/* Modal Container for Centering/Scrolling */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div 
                    className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-md border border-slate-200 animate-in zoom-in duration-200"
                    onClick={e => e.stopPropagation()} // Prevent close on click inside
                >
             <div className={`p-6 relative ${selectedStudent.color.replace('bg-', 'bg-').replace('500', '600')} text-white`}>
                <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full p-1"><X className="w-5 h-5" /></button>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-2 border-white/30 shrink-0">
                        <span className="text-2xl font-bold">{editFormData.name ? editFormData.name.charAt(0) : '?'}</span>
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <input 
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditInputChange}
                                className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50 focus:outline-none focus:bg-white/30 font-bold text-lg"
                                placeholder="Nombre completo"
                            />
                        ) : (
                            <h2 className="text-xl font-bold leading-tight break-words">{selectedStudent.name}</h2>
                        )}
                        <p className="text-white/80 text-sm mt-1 font-medium">Folio #{selectedStudent.id.toString().padStart(3,'0')}</p>
                    </div>
                </div>
             </div>
             
             <div className="p-6 space-y-6">
                {/* DATOS GENERALES EDITABLES */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" />
                            Datos Generales
                        </h3>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Edición Habilitada</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Teléfono Alumno</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    name="phone"
                                    value={editFormData.phone || ''}
                                    onChange={handleEditInputChange}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Sin registro"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Código UDG</label>
                            <div className="relative">
                                <Ticket className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    name="studentCode"
                                    value={editFormData.studentCode || ''}
                                    onChange={handleEditInputChange}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Sin registro"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Camión Asignado</label>
                            <div className="relative">
                                <Bus className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select 
                                    name="busId"
                                    value={editFormData.busId}
                                    onChange={handleEditInputChange}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                >
                                    <option value="1">Camión 1</option>
                                    <option value="2">Camión 2</option>
                                    <option value="3">Camión 3</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Monto Pagado</label>
                            <div className="relative">
                                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    name="payment"
                                    type="number"
                                    value={editFormData.payment || 0}
                                    onChange={handleEditInputChange}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* DATOS CONFIDENCIALES EDITABLES */}
                <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                        Datos Confidenciales
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">Número de Seguro Social (SSN)</label>
                            <div className="relative">
                                <Hash className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    name="ssn"
                                    value={editFormData.ssn || ''}
                                    onChange={handleEditInputChange}
                                    className="w-full pl-9 pr-3 py-2 bg-orange-50/50 border border-orange-100 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all text-slate-700"
                                    placeholder="No registrado"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">Nombre del Padre / Madre / Tutor</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    name="parent"
                                    value={editFormData.parent || ''}
                                    onChange={handleEditInputChange}
                                    className="w-full pl-9 pr-3 py-2 bg-orange-50/50 border border-orange-100 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all text-slate-700"
                                    placeholder="No registrado"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">Teléfono de Emergencia (Tutor)</label>
                            <div className="relative">
                                <PhoneCall className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    name="parentPhone"
                                    value={editFormData.parentPhone || ''}
                                    onChange={handleEditInputChange}
                                    className="w-full pl-9 pr-3 py-2 bg-orange-50/50 border border-orange-100 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all text-slate-700"
                                    placeholder="No registrado"
                                />
                            </div>
                        </div>
                    </div>
                </div>
             </div>
             
             {/* FOOTER CON BOTÓN DE GUARDAR */}
             <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3">
                <button 
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSaveChanges}
                    disabled={!isEditing && !saving}
                    className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all flex items-center gap-2 ${
                        isEditing || saving 
                        ? 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5' 
                        : 'bg-indigo-300 cursor-not-allowed'
                    }`}
                >
                    {saving ? 'Guardando...' : (
                        <>
                            <Save className="w-4 h-4" />
                            Guardar Cambios
                        </>
                    )}
                </button>
             </div>
          </div>
          </div>
        </div>
      )}

      {/* --- MODAL PERMUTAS --- */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="bg-slate-800 p-4 text-center relative border-b border-slate-700">
                <button onClick={() => setShowSwapModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2"><ArrowRightLeft className="w-5 h-5 text-orange-400" /> Sistema de Permutas</h2>
                <p className="text-slate-400 text-xs mt-0.5">Intercambio de camiones por Folio</p>
             </div>
             <div className="p-6">
                <div className="flex gap-4">
                    <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Folio #1</label><input type="number" value={swapId1} onChange={(e) => setSwapId1(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-center font-bold" placeholder="#" /></div>
                    <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Folio #2</label><input type="number" value={swapId2} onChange={(e) => setSwapId2(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-center font-bold" placeholder="#" /></div>
                </div>
                {/* Preview Logic reused from previous */}
                {swapMessage && <p className="mt-4 text-green-600 text-xs font-bold text-center bg-green-50 p-2 rounded animate-pulse">{swapMessage}</p>}
                {swapError && <p className="mt-4 text-red-600 text-xs font-bold text-center bg-red-50 p-2 rounded">{swapError}</p>}
                <div className="mt-4">
                    <button onClick={initiateSwap} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg text-sm shadow-lg shadow-orange-100">Iniciar Trámite</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL NOTIFICACIONES --- */}
      {showNotifications && (
        <div className="absolute top-20 right-4 md:right-8 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 overflow-hidden animate-in slide-in-from-top-5 duration-200">
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm">Solicitudes Pendientes</h3>
                <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {pendingRequests.length === 0 ? <div className="p-8 text-center text-slate-400 text-xs">No hay solicitudes.</div> : (
                    <div className="divide-y divide-slate-100">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="p-3 hover:bg-slate-50">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2"><span className="font-bold text-orange-600">{req.requesterName}</span> solicita:</div>
                                <div className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded mb-3">
                                    <div className="text-center flex-1"><div className="font-bold text-slate-800 text-xs">{req.u1.name}</div><div className="text-[9px] text-slate-400">C{req.u1.busId}</div></div>
                                    <ArrowRightLeft className="w-3 h-3 text-orange-400" />
                                    <div className="text-center flex-1"><div className="font-bold text-slate-800 text-xs">{req.u2.name}</div><div className="text-[9px] text-slate-400">C{req.u2.busId}</div></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAcceptRequest(req)} className="flex-1 bg-green-500 text-white text-xs font-bold py-1.5 rounded"><Check className="w-3 h-3 inline" /> Aceptar</button>
                                    <button onClick={() => handleRejectRequest(req.id)} className="flex-1 bg-red-100 text-red-600 text-xs font-bold py-1.5 rounded"><Trash2 className="w-3 h-3 inline" /> Rechazar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isAdminMode ? (
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold text-white flex items-center gap-1 ${adminAuthBusId === 'all' ? 'bg-slate-800' : 'bg-orange-600'}`}>
                      <Bus className="w-3 h-3" />
                      {adminAuthBusId === 'all' ? 'COORD. GENERAL' : `ENCARGADO C${adminAuthBusId}`}
                  </div>
              ) : (
                  <div className="text-orange-600 flex items-center gap-1 font-semibold text-xs uppercase tracking-wider">
                      <Eye className="w-3 h-3" /> Vista Pública
                  </div>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              Lista FIL 2025
              {isAdminMode && <span className="text-lg font-normal text-slate-500 border-l border-slate-300 pl-3">{adminName}</span>}
            </h1>
            
            <div className="flex items-center gap-3 mt-2 text-slate-500 text-sm">
               <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>Guadalajara, Jal.</span></div>
               {isAdminMode && <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><Cloud className="w-3 h-3" /><span>{saving ? 'Guardando...' : 'Sincronizado'}</span></div>}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {isAdminMode && (
              <div className={`p-3 rounded-xl border shadow-sm min-w-[140px] flex flex-col items-center justify-center text-white transition-all ${currentBusFilter==='1'?'bg-orange-600 border-orange-700':currentBusFilter==='2'?'bg-blue-600 border-blue-700':currentBusFilter==='3'?'bg-purple-600 border-purple-700':'bg-slate-900 border-slate-800'}`}>
                <span className="text-white/70 text-[10px] font-bold uppercase">{stats.label}</span>
                <span className="text-2xl font-bold">${stats.recaudado}</span>
              </div>
            )}
            <div className="bg-white p-3 rounded-xl border-b-4 border-green-500 shadow-sm min-w-[90px] flex flex-col items-center justify-center"><span className="text-green-600 text-[10px] font-bold uppercase">Pagados</span><span className="text-lg font-bold text-slate-800">{stats.pagados}</span></div>
            <div className="bg-white p-3 rounded-xl border-b-4 border-amber-500 shadow-sm min-w-[90px] flex flex-col items-center justify-center"><span className="text-amber-600 text-[10px] font-bold uppercase">Anticipos</span><span className="text-lg font-bold text-slate-800">{stats.parciales}</span></div>
            <div className="bg-white p-3 rounded-xl border-b-4 border-red-500 shadow-sm min-w-[90px] flex flex-col items-center justify-center"><span className="text-red-600 text-[10px] font-bold uppercase">Pendientes</span><span className="text-lg font-bold text-slate-800">{stats.pendientes}</span></div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 w-full bg-transparent focus:outline-none text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="relative border-l border-slate-200 pl-2">
                    <select value={currentBusFilter} onChange={(e) => setCurrentBusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2 pr-8 appearance-none cursor-pointer font-medium">
                        <option value="all">Ver Todos</option>
                        <option value="1">Ver Camión 1</option>
                        <option value="2">Ver Camión 2</option>
                        <option value="3">Ver Camión 3</option>
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
            </div>
            
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-5 h-5" /></button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-5 h-5" /></button>
              
              <div className="h-6 w-px bg-slate-200 mx-1"></div>

              {isAdminMode ? (
                <>
                  <button onClick={() => setShowNotifications(!showNotifications)} className="flex items-center justify-center w-9 h-9 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all relative" title="Notificaciones">
                    <Bell className="w-5 h-5" />
                    {pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{pendingRequests.length}</span>}
                  </button>
                  <button onClick={() => setShowSwapModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all" title="Realizar Permutas"><ArrowRightLeft className="w-4 h-4" /><span className="hidden sm:inline">Permutar</span></button>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all ml-1"><LogIn className="w-4 h-4 rotate-180" /><span className="hidden sm:inline">Salir</span></button>
                </>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all ml-1"><Lock className="w-4 h-4" /><span className="hidden sm:inline">Soy Encargado</span></button>
              )}
            </div>
        </div>

        {/* Content Section */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No hay pasajeros en esta vista</h3>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => {
                   const status = getPaymentStatus(user.payment);
                   const isCoordinator = user.role === "Coordinador";
                   return (
                    <div key={user.id} className={`bg-white rounded-xl border shadow-sm transition-all duration-300 relative overflow-hidden group ${isCoordinator ? 'border-orange-400 shadow-orange-100' : status.color.includes('red') ? 'border-red-200 shadow-red-100' : status.color.includes('green') ? 'border-green-200 shadow-green-100' : 'border-amber-200 shadow-amber-100'}`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${user.busId === 1 ? 'bg-orange-300' : user.busId === 2 ? 'bg-blue-300' : 'bg-purple-300'}`}></div>
                        <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-mono font-bold bg-slate-50 px-1.5 rounded border border-slate-100">#{user.id.toString().padStart(3, '0')}</div>

                        <div className="p-5 pl-7">
                            <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => handleUserClick(user)}>
                                <div className="flex items-center gap-3">
                                <UserAvatar user={user} size="lg" />
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight hover:text-indigo-600 transition-colors">{user.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-white ${user.busId === 1 ? 'bg-orange-500' : user.busId === 2 ? 'bg-blue-500' : 'bg-purple-500'}`}><Bus className="w-3 h-3" /> C{user.busId}</span>
                                    </div>
                                </div>
                                </div>
                                <div className={`px-2 py-1 rounded-md text-xs font-bold border ${isCoordinator ? 'text-orange-600 bg-orange-50 border-orange-200' : status.color}`}>{isCoordinator ? 'COORDINADOR' : status.label}</div>
                            </div>
                            {(user.phone || user.studentCode) && (
                                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs">
                                    {user.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /><span>{user.phone}</span></div>}
                                    {user.studentCode && <div className="flex items-center gap-1 font-mono"><Ticket className="w-3 h-3" /><span>{user.studentCode}</span></div>}
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Monto Pagado</label>
                                <PaymentInput user={user} />
                            </div>
                        </div>
                    </div>
                   );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                        <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase w-10 whitespace-nowrap">Folio</th>
                        <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Pasajero y Contacto</th>
                        <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Camión</th>
                        <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Estado</th>
                        <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase w-1/4 text-center whitespace-nowrap">Registrar Pago</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((user) => {
                        const status = getPaymentStatus(user.payment);
                        const StatusIcon = status.icon;
                        const isCoordinator = user.role === "Coordinador";
                        return (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-4 whitespace-nowrap"><span className="font-mono text-xs text-slate-400 font-bold">#{user.id.toString().padStart(3, '0')}</span></td>
                                <td className="px-3 py-4 cursor-pointer min-w-[180px]" onClick={() => handleUserClick(user)}>
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={user} size="sm" />
                                    <div>
                                    <div className="font-semibold text-slate-900 text-sm hover:text-indigo-600 transition-colors">{user.name}</div>
                                    <div className="text-xs text-slate-500 flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                                        <span className="font-medium text-slate-600">{user.role}</span>
                                        {user.phone && <span className="flex items-center gap-1 text-slate-400"><Phone className="w-3 h-3" /> {user.phone}</span>}
                                        {user.studentCode && <span className="flex items-center gap-1 font-mono text-slate-400"><Ticket className="w-3 h-3" /> {user.studentCode}</span>}
                                    </div>
                                    </div>
                                </div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-bold ${user.busId === 1 ? 'bg-orange-500' : user.busId === 2 ? 'bg-blue-500' : 'bg-purple-500'}`}><Bus className="w-3 h-3" /> C{user.busId}</span></td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                    {isCoordinator ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border text-orange-600 bg-orange-50 border-orange-200"><ShieldCheck className="w-3 h-3" /> Coord.</div>
                                    ) : (
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${status.color}`}><StatusIcon className="w-3 h-3" /> {status.label}</div>
                                    )}
                                </td>
                                <td className="px-3 py-4 min-w-[140px]"><PaymentInput user={user} /></td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentList;