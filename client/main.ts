import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		// serverURL: "ws://localhost:8080"
		serverURL: "wss://multipongplay.herokuapp.com"
	}
});

export default app;