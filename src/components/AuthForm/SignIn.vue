<template>
	<n-form ref="formRef" :model="user">
		<n-form-item path="email" label="Email">
			<n-input
				v-model:value="user.email"
				placeholder="Example@email.com"
				size="large"
				autocomplete="on"
			/>
		</n-form-item>
		<n-form-item path="password" label="Password">
			<n-input
				v-model:value="user.password"
				type="password"
				show-password-on="click"
				placeholder="At least 8 characters"
				autocomplete="on"
				size="large"
			/>
		</n-form-item>
		<div class="flex flex-col items-end gap-6">
			<div class="flex justify-end w-full">
				<!-- <n-checkbox size="large">Remember me</n-checkbox> -->
				<n-button text type="primary">Forgot Password?</n-button>
			</div>
			<div class="w-full">
				<n-button type="primary" @click="login" class="!w-full" size="large">Sign in</n-button>
			</div>
		</div>
	</n-form>
</template>

<script>
import { defineComponent, ref} from "vue"
import {NForm,NFormItem,NInput,NButton} from "naive-ui"
import axios from 'axios'
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

export default defineComponent({
  components: { NForm,NFormItem,NInput,NButton},
    setup() {
		const authStore = useAuthStore();

		const router = useRouter();

		const user = ref({
			email: '',
			password: '',
			device_name: 'browser'
		});

		const login = async () => {
			console.log('Form data:', user.value);
			try {
				const response = await axios.post(import.meta.env.VITE_BACKEND_URL + '/api/authentications/login', user.value, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
				console.log('API response:', response.data);
				authStore.setLogged(response.data);

				const userId = response.data.id;
				// const state = response.data.permissions;
				// console.log('state', response.data.permissions);

				localStorage.setItem('userId', userId);
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('state', response.data.permissions);

				Swal.fire({
					width: 380,
					html: '<span class="text-sm">You have successfully logged in!</span>',
					icon: 'success',
					confirmButtonText: 'Okay',
					timer: 1500,
					timerProgressBar: true,
					confirmButtonColor: '#0095e8',
					customClass: {
						confirmButton: 'text-sm px-4 py-2 text-white',
					},
				}).then(() => {
					router.push('/dashboards');
				});



			} catch (error) {
				console.error('API error:', error);
				Swal.fire({
					width: 380,
					html: '<span class="text-sm">Please check your credentials and try again.</span>',
					icon: 'error',
					confirmButtonText: 'Okay',
					confirmButtonColor: '#0095e8',
					customClass: {
						confirmButton: 'text-sm px-4 py-1.5 text-white focus-none',
					},
				})
			}
		}

		return {
			user,
			login
		}
	},
})
</script>
