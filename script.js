const DISCIPLINES = [
"Português",
"Redação",
"Literatura",
"Matemática",
"Raciocínio Lógico",
"Física",
"Química",
"Biologia",
"História",
"Geografia",
"Filosofia",
"Sociologia",
"Inglês",
"Espanhol",
"Informática",
"Direito Constitucional",
"Direito Administrativo",
"Direito Penal",
"Direito Processual Penal",
"Direito Civil",
"Direito Processual Civil",
"Direito Tributário",
"Direito Previdenciário",
"Direitos Humanos",
"Legislação Especial",
"Contabilidade",
"Administração",
"Economia",
"Estatística",
"Arquivologia"
];

let cards = JSON.parse(localStorage.getItem("cards") || "[]");

let studyList = [];
let currentIndex = 0;
let editingId = null;

const cardEl = document.getElementById("flashcard");

const qEl = document.getElementById("cardQuestion");
const aEl = document.getElementById("cardAnswer");
const dEl = document.getElementById("cardDiscipline");
const dBackEl = document.getElementById("cardDisciplineBack");

function save(){
localStorage.setItem("cards", JSON.stringify(cards));
}

/* ================= SM2 ================= */

function applySM2(card, quality){

if(quality < 3){
card.repetitions = 0;
card.interval = 1;
}else{

```
if(card.repetitions === 0) card.interval = 1;
else if(card.repetitions === 1) card.interval = 6;
else card.interval = Math.round(card.interval * card.easeFactor);

card.repetitions++;
```

}

card.easeFactor = card.easeFactor +
(0.1 - (5-quality)*(0.08+(5-quality)*0.02));

if(card.easeFactor < 1.3) card.easeFactor = 1.3;

const date = new Date();
date.setDate(date.getDate() + card.interval);

card.nextReview = date.toISOString().split("T")[0];
}

/* ================= RENDER DISCIPLINAS ================= */

function renderDisciplineCards(){

const container = document.getElementById("disciplineArea");
container.innerHTML = "";

const map = {};

cards.forEach(card=>{
if(!map[card.discipline]) map[card.discipline] = [];
map[card.discipline].push(card);
});

Object.keys(map).forEach(discipline=>{


const section = document.createElement("section");
section.className = "discipline";
section.dataset.discipline = discipline;

section.innerHTML = `
  <h1>${discipline}</h1>

  <div class="row-wrapper">

    <button class="nav prev">‹</button>

    <div class="row-container"></div>

    <button class="nav next">›</button>

  </div>
`;

const row = section.querySelector(".row-container");

map[discipline].forEach(card=>{

  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <div class="editIcon">✏️</div>

    <div class="card-inner">

      <div class="front">
        <h2>${card.discipline}</h2>
        <p>${card.question}</p>
      </div>

      <div class="back">
        <p>${card.answer}</p>

        <div class="difficulty">
          <button class="diff" data-level="easy">Fácil</button>
          <button class="diff" data-level="medium">Médio</button>
          <button class="diff" data-level="hard">Difícil</button>
        </div>

      </div>

    </div>
  `;

  /* FLIP */
  div.onclick = ()=>{
    div.classList.toggle("flip");
  };

  /* ABRIR ESTUDO */
  div.ondblclick = (e)=>{
    e.stopPropagation();
    openStudyFromCard(card.id);
  };

  /* EDITAR */
  div.querySelector(".editIcon").onclick = (e)=>{
    e.stopPropagation();
    startEdit(card.id);
  };

  row.appendChild(div);

});

container.appendChild(section);


});

}

/* ================= ADD / EDIT ================= */

document.getElementById("addBtn").onclick = ()=>{

const comp = document.getElementById("estudo").value;

if(!comp || !comp.disciplina){
alert("Selecione disciplina");
return;
}

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");

const question = questionEl.value.trim();
const answer = answerEl.value.trim();

if(!question || !answer){
alert("Preencha tudo");
return;
}

if(editingId){

```
const card = cards.find(c=>c.id===editingId);

card.discipline = comp.disciplina;
card.subtitle = comp.tema;
card.question = question;
card.answer = answer;

editingId = null;
```

}else{

```
const card = {
  id: Date.now(),
  discipline: comp.disciplina,
  subtitle: comp.tema,
  question,
  answer,
  repetitions:0,
  interval:0,
  easeFactor:2.5,
  nextReview:new Date().toISOString().split("T")[0],
  history:[]
};

cards.push(card);
```

}

save();
renderDisciplineCards();

questionEl.value="";
answerEl.value="";
questionEl.focus();

};

/* ================= EDIT ================= */

function startEdit(id){

const card = cards.find(c=>c.id===id);
if(!card) return;

editingId = id;

document.getElementById("question").value = card.question;
document.getElementById("answer").value = card.answer;

const comp = document.getElementById("estudo");

if(comp.setValue){
comp.setValue({
disciplina: card.discipline,
tema: card.subtitle
});
}

}

/* ================= OPEN STUDY ================= */

function openStudyFromCard(id){

const index = cards.findIndex(c=>c.id===id);
if(index === -1) return;

studyList = [cards[index]];
currentIndex = 0;

showCard();
showArea("study");

}

/* ================= SHOW CARD ================= */

function showCard(){

if(studyList.length===0){
qEl.innerText="Sem cards hoje";
aEl.innerText="";
dEl.innerText="";
dBackEl.innerText="";
return;
}

const card = studyList[currentIndex];

qEl.innerText = card.question;
aEl.innerText = card.answer;
dEl.innerText = `${card.discipline} — ${card.subtitle || ""}`;
dBackEl.innerText = `${card.discipline} — ${card.subtitle || ""}`;

cardEl.classList.remove("flip");
}

/* ================= NEXT ================= */

function loadNext(){

currentIndex++;

if(currentIndex>=studyList.length){
alert("Sessão concluída");
return;
}

showCard();
}

/* ================= FLIP ================= */

cardEl.onclick = ()=>{
cardEl.classList.toggle("flip");
};

/* ================= DIFFICULTY (delegation) ================= */

document.addEventListener("click", function(e){

if(!e.target.classList.contains("diff")) return;

e.stopPropagation();

if(studyList.length===0) return;

const level = e.target.dataset.level;

let quality=4;

if(level==="easy") quality=5;
if(level==="medium") quality=4;
if(level==="hard") quality=2;

const card = studyList[currentIndex];

applySM2(card,quality);

card.history.push({
date:new Date().toISOString(),
quality
});

save();

loadNext();

});

/* ================= TODAY ================= */

function getTodayCards(){

const today = new Date().toISOString().split("T")[0];

return cards.filter(c=>c.nextReview <= today);
}

document.getElementById("navToday").onclick = ()=>{

studyList = getTodayCards();
currentIndex=0;

showCard();
showArea("study");
};

/* ================= STATS ================= */

function renderStats(){

const stats = document.getElementById("stats");

let total = cards.length;
let today = getTodayCards().length;

let avgEase =
cards.reduce((a,c)=>a+c.easeFactor,0)/total || 0;

stats.innerHTML = `

  <p>Total Cards: ${total}</p>
  <p>Revisão Hoje: ${today}</p>
  <p>Facilidade Média: ${avgEase.toFixed(2)}</p>
  `;
}

document.getElementById("navStats").onclick = ()=>{
renderStats();
showArea("stats");
};

/* ================= CALENDAR ================= */

function renderCalendar(){

const cal = document.getElementById("calendar");
cal.innerHTML="";

let map={};

cards.forEach(c=>{
if(!map[c.nextReview]) map[c.nextReview]=0;
map[c.nextReview]++;
});

Object.keys(map).sort().forEach(date=>{


const div=document.createElement("div");
div.innerText = `${date} → ${map[date]} cards`;

cal.appendChild(div);


});
}

document.getElementById("navCalendar").onclick = ()=>{
renderCalendar();
showArea("calendar");
};

/* ================= AREAS ================= */

function showArea(name){

document.getElementById("studyArea").classList.add("hidden");
document.getElementById("statsArea").classList.add("hidden");
document.getElementById("calendarArea").classList.add("hidden");

if(name==="study")
document.getElementById("studyArea").classList.remove("hidden");

if(name==="stats")
document.getElementById("statsArea").classList.remove("hidden");

if(name==="calendar")
document.getElementById("calendarArea").classList.remove("hidden");
}

/* ================= INIT ================= */

renderDisciplineCards();
