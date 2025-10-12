/* bundle.js 
Combined: stars.js + main.js + observer
*/

(function(){ 
/* ---------- Stars canvas (adapted) ---------- */ 
const canvas = document.getElementById("stars"); 
const ctx = canvas ? canvas.getContext("2d") : null; 
let stars = []; 
let starsCount = 110; 

function resizeCanvas(){ 
if(!canvas) return; 
canvas.width = window.innerWidth; 
canvas.height = window.innerHeight; 
// regenerate stars in case of size change 
stars = []; 
for(let i=0;i<starsCount;i++){ 
stars.push({ 
x: Math.random() * canvas.width, 
y: Math.random() * canvas.height, 
r: Math.random() * 1.8 + 0.2, 
dx: (Math.random() - 0.5) * 0.25, 
dy: (Math.random() - 0.5) * 0.25, 
alpha: Math.random() * 0.8 + 0.2, 
pulse: Math.random() * 0.02 + 0.005 
}); 
} 
} 
resizeCanvas(); 
window.addEventListener("resize", resizeCanvas); 

function drawStars(){ 
if(!ctx) return; 
ctx.clearRect(0,0,canvas.width,canvas.height); 

// soft background gradient overlay (very subtle) 
const g = ctx.createLinearGradient(0,0,0,canvas.height); 
g.addColorStop(0, "rgba(13,17,23,0.0)"); 
g.addColorStop(1, "rgba(13,17,23,0.0)"); 
ctx.fillStyle = g; 
ctx.fillRect(0,0,canvas.width,canvas.height); 

// draw each star 
for(let i=0;i<stars.length;i++){ 
const s = stars[i]; 
ctx.beginPath(); 
ctx.globalAlpha = s.alpha; 
ctx.fillStyle = "#F5F3CE"; 
ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); 
ctx.fill(); 

// twinkle / pulse 
s.alpha += Math.sin(Date.now() * s.pulse) * 0.002; 
if(s.alpha < 0.08) s.alpha = 0.08; 
if(s.alpha > 1) s.alpha = 1; 

// move 
s.x += s.dx; 
s.y += s.dy; 
if(s.x < -10) s.x = canvas.width + 10; 
if(s.x > canvas.width + 10) s.x = -10; 
if(s.y < -10) s.y = canvas.height + 10; 
if(s.y > canvas.height + 10) s.y = -10; 
} 
ctx.globalAlpha = 1; 
requestAnimationFrame(drawStars); 
} 
drawStars(); 

/* ---------- Main app (search + UI) ---------- */ 
document.addEventListener("DOMContentLoaded", function(){ 
const searchBtn = document.getElementById("search-btn"); 
const usernameInput = document.getElementById("username-input"); 
const profileContainer = document.getElementById("profile-container"); 

function renderProfile(data){ 
const twitterBlock = data.twitter_username 
? `<a href="https://x.com/${data.twitter_username}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-x-twitter"></i></a>` 
: ""; 
const blogBlock = (data.blog && data.blog.trim() !== "") 
? `<a href="${(data.blog.startsWith('http')?data.blog:'https://'+data.blog)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-globe"></i></a>` 
: ""; 
const locationBlock = data.location ? `<span class="location"><i class="fa-solid fa-location-dot"></i> ${data.location}</span>` : ""; 

profileContainer.innerHTML = ` 
<section class="profile-card observe observe-hidden"> 
<img src="${data.avatar_url}" alt="${data.login}" class="avatar" /> 
<h2>${data.name || data.login}</h2> 
<p class="bio">${data.bio || "Bio no."}</p> 

<ul class="stats"> 
<li><strong>${data.followers}</strong> Follower</li> 
<li><strong>${data.following}</strong> Followed</li> 
<li><strong>${data.public_repos}</strong> Repo</li> 
</ul> 

<div class="social-links"> 
<a href="${data.html_url}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i></a> 
${twitterBlock} 
${blogBlock} 
${locationBlock} 
</div> 
</section> 
`; 

// trigger observer check for newly added node 
observeAll(); 
} 

function renderError(message){ 
profileContainer.innerHTML = `<p class="error observe observe-hidden">${message}</p>`; 
observeAll(); 
} 

if(searchBtn){ 
searchBtn.addEventListener("click", function(){ 
const username = usernameInput.value.trim(); 
if(!username){ 
return alert("Enter username!"); 
} 
profileContainer.innerHTML = `<p class="observe observe-hidden">Loading...</p>`; 
observeAll(); 

fetch(`https://api.github.com/users/${encodeURIComponent(username)}`) 
.then(res => { 
if(!res.ok){ 
if(res.status === 404) throw new Error("User not found!"); 
throw new Error("An error occurred: " + res.status); 
} 
return res.json(); 
}) 
.then(data => renderProfile(data)) 
.catch(err => renderError(err.message)); 
}); 

// also allow Enter key on input 
usernameInput.addEventListener("keydown", function(e){ 
if(e.key === "Enter"){ 
searchBtn.click(); 
} 
}); 
} 

/* ---------- Intersection Observer (observer effect) ---------- */

let observer = null; 
function initObserver(){ 
if(observer) observer.disconnect(); 
const options = { 
root: null, 
rootMargin: "0px 0px -8% 0px", 
threshold: 0.08 
}; 
observer = new IntersectionObserver((entries)=>{ 
entries.forEach(entry=>{ 
if(entry.isIntersecting){ 
entry.target.classList.add("observe-visible"); 
entry.target.classList.remove("observe-hidden"); 
// once visible, unobserve to avoid repeating 
observer.unobserve(entry.target); 
} 
}); 
}, options); 
} 
initObserver(); 

function observeAll(){ 
// find elements with 'observe' class and ensure observer will watch them 
const nodes = document.querySelectorAll(".observe"); 
nodes.forEach(n=>{ 
// ensure hidden class exists initially 
if(!n.classList.contains("observe-visible")){ 
n.classList.add("observe-hidden"); 
} 
// observe node 
if(observer && n) observer.observe(n); 
}); 
} 

// initial observation for any elements present at load 
observeAll(); 

// re-init observer on resize (helps with rootMargin effects) 
window.addEventListener("resize", function(){ 
initObserver(); 
observeAll(); 
}); 
});
})();