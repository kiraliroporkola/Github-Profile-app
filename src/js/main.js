const searchBtn = document.getElementById("search-btn");
const usernameInput = document.getElementById("username-input");
const profileContainer = document.getElementById("profile-container");

searchBtn.addEventListener("click", () => { 
const username = usernameInput.value.trim(); 
if (!username) return alert("Enter username!"); 

fetch(`https://api.github.com/users/${username}`) 
.then((res) => { 
if (!res.ok) throw new Error("User not found!"); 
return res.json(); 
}) 
.then((data) => { 
profileContainer.innerHTML = ` 
<section class="profile-card"> 
<img src="${data.avatar_url}" alt="${data.login}" class="avatar" /> 
<h2>${data.name || data.login}</h2> 
<p class="bio">${data.bio || "No bio."}</p> 

<ul class="stats"> 
<li><strong>${data.followers}</strong> Follower</li> 
<li><strong>${data.following}</strong> Followed</li> 
<li><strong>${data.public_repos}</strong> Repo</li> 
</ul> 

<div class="social-links"> 
<a href="${data.html_url}" target="_blank"><i class="fa-brands fa-github"></i></a> 
${data.twitter_username ? `<a href="https://x.com/${data.twitter_username}" target="_blank"><i class="fa-brands fa-x-twitter"></i></a>` : ""} 
${data.blog ? `<a href="${data.blog}" target="_blank"><i class="fa-solid fa-globe"></i></a>` : ""} 
${data.location ? `<span class="location"><i class="fa-solid fa-location-dot"></i> ${data.location}</span>` : ""} 
</div> 
</section> 
`; 
}) 
.catch((err) => { 
profileContainer.innerHTML = `<p class="error">${err.message}</p>`; 
});
}); 
