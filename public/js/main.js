window.addEventListener('load', () => {
	let buttons = document.querySelectorAll(".button_free");

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", toggle);
	}

	function toggle(e) {
		console.log(e);
		if (e.path[1].childNodes[3].innerHTML == "Vrij") {
			console.log(321);
			e.path[0].innerHTML = "cancel reservering";
			e.path[1].childNodes[3].innerHTML = "gereserveerd";
			e.path[2].classList.add("reserved");
		} else {
			console.log(123);
			e.path[0].innerHTML = "Reserveer ruimte";
			e.path[1].childNodes[3].innerHTML = "Vrij";
			e.path[2].classList.remove("reserved");
		}
	}
	function toggleWatch (e){
		if(e.path[0].innerHTML === "Watch"){
			e.path[0].innerHTML = "Stop watching";
			e.path[0].name = "watching";
		}else{
			e.path[0].innerHTML = "Watch";
			e.path[0].name = "watch room";
		}
	}

	let buttonsWatch = document.querySelectorAll(".button_watch");


	// service workers not supported
	if (!'serviceWorker' in navigator) {
		document.body.insertAdjacentHTML(
			'beforebegin',
			'<p>Service worker not supported</p>'
		)
		return
	}
	const publicKey = `BCANhhPU81xZf5kNWxH5TptShvsBNqv5juq5HOcWmOVlbN0heJ3bJYJO4WM9EoYHEecTgCtZPtZboRD52mDdmEI`

	const send = async() => {
		let register = await navigator.serviceWorker.register(
			'/sw.js'
		)

		for (var i = 0; i < buttonsWatch.length; i++) {
			buttonsWatch[i].addEventListener("click", function(e){
				subscribeForm(e)
				toggleWatch(e)
			});
		}

		const subscription = await register.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(publicKey)
		})

		async function subscribeForm(e) {
			e.preventDefault()
			console.log(e.target.value);

			subscription.name = e.target.value
			console.log(subscription);
			if (e.target.name === "watch room") {
				await fetch('/subscribe', {
					method: 'POST',
					body: JSON.stringify({
						name: "Watching " + e.target.value,
						subscription: JSON.stringify(subscription)
					}),
					headers: {
						'content-type': 'application/json'
					}
				})
				setTimeout(async function() {
					await fetch('/subscribe', {
						method: 'POST',
						body: JSON.stringify({
							name: e.target.value + " is free",
							subscription: JSON.stringify(subscription)
						}),
						headers: {
							'content-type': 'application/json'
						}
					})
					toggleWatch(e);
    			}, Math.floor(Math.random()*2000)*10)
			}
		}

		// setTimeout(async function() {

		// }, 3000)
	}

	send()
})

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
