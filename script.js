// Smooth Scroll

document.querySelectorAll('nav a').forEach(link => {

link.addEventListener('click', function(e){

e.preventDefault();

const target=document.querySelector(this.getAttribute('href'));

if(target){

target.scrollIntoView({

behavior:'smooth'

});

}

});

});

// Welcome Message

window.onload=function(){

console.log("Welcome to Learn CAD with Er. Arun Banjare");

};

// Button Animation

const buttons=document.querySelectorAll(".btn,.btn2");

buttons.forEach(btn=>{

btn.addEventListener("mouseenter",()=>{

btn.style.transform="scale(1.05)";

});

btn.addEventListener("mouseleave",()=>{

btn.style.transform="scale(1)";

});

});