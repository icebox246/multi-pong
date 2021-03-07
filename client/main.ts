import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		serverURL: "ws://localhost:8080"
		serverURL: "ws://multipongplay.herokuapp.com:8080"
	}
});

export default app;