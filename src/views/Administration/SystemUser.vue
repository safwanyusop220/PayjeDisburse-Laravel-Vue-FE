<template>
	<CardCodeExample ref="card">
		<n-space vertical :size="12">
        <p class="font-bold text-xl text-black">SYSTEM USER</p>
        <div class="flex justify-between">
            <n-input class="mr-[300px]" v-model:value="searchQuery" placeholder="Search">
              <template #prefix>
                <n-icon :component="MdSearch" />
              </template>
            </n-input>
            <div>
              <n-button  @click="showModal = true" type="success">
                <n-icon :component="Add12Filled" size="17" class="mr-1"/>
                Create
              </n-button>
              <n-modal 
                  v-model:show="showModal"
                  :mask-closable="true"
                  >
                  <n-card
                      style="width: 1000px; margin-top: 50px; margin-bottom: 100px;"
                      title="CREATE USER"
                      :bordered="false"
                      size="huge"
                      role="dialog"                    
                      :style="{background: 'white'}"
                    >
                      <n-form
                          :model="user"
                          @submit="registerUser"
                          :label-placement="placement"
                          require-mark-placement="right-hanging"
                          label-width="auto"
                        >
                          <!--Name/Email-->
                          <n-grid x-gap="22" :cols="2">
                            <n-gi>
                              <n-form-item label="Full Name" :feedback="user.errors['name']">
                                <n-input v-model:value="user.name" :status="statuses.name" placeholder="Name"/>
                                <template #feedback>
                                  <span class="text-xs text-red-500" v-if="user.errors['name']">
                                    {{ user.errors['name'] }}
                                  </span>
                                </template>
                              </n-form-item>
                            </n-gi>
                            <n-gi>
                              <n-form-item label="Email Address" :feedback="user.errors['email']">
                                <n-input v-model:value="user.email" :status="statuses.email" placeholder="Email"/>
                                <template #feedback>
                                  <span class="text-xs text-red-500" v-if="user.errors['email']">
                                    {{ user.errors['email'] }}
                                  </span>
                                </template>
                              </n-form-item>
                            </n-gi>
                          </n-grid>
                          <!--Password/defaultPassword-->
                          <n-grid x-gap="22" :cols="2">
                            <n-gi>
                              <n-grid x-gap="22" :cols="2">
                                <n-gi>
                                  <n-form-item label="Password" :feedback="user.errors['password']">
                                    <n-input type="text" v-model:value="user.password" :status="statuses.password" placeholder="Password"/>
                                    <template #feedback>
                                      <span class="text-xs text-red-500" v-if="user.errors['password']">
                                        {{ user.errors['password'] }}
                                      </span>
                                    </template>
                                  </n-form-item>
                                </n-gi>
                                <n-gi>
                                  <n-form-item>
                                    <div class="border py-2 px-3 rounded-md w-full flex items-center">
                                      <n-checkbox
                                        size="small"
                                        label="Default Password"
                                        @update:checked="handleCheckedChange"
                                      />
                                    </div>
                                  </n-form-item>
                                </n-gi>
                              </n-grid>
                            </n-gi>
                            <!--Role/Define Access-->
                            <n-gi>
                              <n-grid x-gap="22" :cols="2">
                                <n-gi>
                                  <!--Role-->
                                  <n-form-item label="Role Name" :feedback="user.errors['role']">
                                    <n-select
                                      v-model:show="showRoles"
                                      filterable
                                      :options="roleOptions"
                                      v-model:value="user.role"
                                      placeholder="Select an option"
                                      @update:value="getSelectedRolePermissionById"
                                      :status="statuses.role"
                                      >
                                        <template v-if="showRoles" #arrow>
                                            <md-search />
                                        </template>
                                    </n-select>
                                    <template #feedback>
                                      <span class="text-xs text-red-500" v-if="user.errors['role']">
                                        {{ user.errors['role'] }}
                                      </span>
                                    </template>
                                  </n-form-item>
                                </n-gi>
                                <n-gi>
                                  <n-form-item>
                                    <!-- <div class="border py-2 px-3 rounded-md w-full flex items-center">
                                        <n-checkbox size="medium" class="mr-2"/>
                                        <p class="m-0 text-xs">Define Access</p>
                                    </div> -->
                                    <div class="border py-2 px-3 rounded-md w-full flex items-center">
                                      <n-checkbox
                                        v-model:checked="checkedHandleDefineAccess"
                                        label="Custom Access"
                                        @update:checked="handleDefineAccess"
                                        @click="disabled = !disabled"
                                        v-model:value="user.isCustomAccess"
                                      />
                                    </div>
                                  </n-form-item>
                                </n-gi>
                              </n-grid>
                            </n-gi>
                          </n-grid>

                          <!--Permission-->
                          <!-- <n-card  class="mb-4" size="small" :hoverable="true" :bordered="true" :style="{ borderColor: 'var(--grey-300-border-color)' }">
                            <n-checkbox size="small" label="All Access" @click="value = !value" />
                          </n-card> -->
                          <n-form-item :feedback="user.errors['permissions']">
                            <n-grid x-gap="15" y-gap="15" class="mb-5" :cols="3">
                              <template v-for="(permissionsGroup, groupId) in permissions" :key="groupId">
                                <n-gi>
                                  <n-card size="small" :hoverable="true" :bordered="true" :style="{ borderColor: 'var(--grey-300-border-color)' }">

                                    <!-- <n-checkbox size="small" v-model:checked="value"  :label="permissionsGroup[0].group_name" :disabled="disabled"/> -->
                                    <p class="font-bold text-black">{{ permissionsGroup[0].group_name }}</p>

                                    <template v-for="permission in permissionsGroup" :key="permission.id">
                                        <n-checkbox-group v-model:value="selectedRolePermissions.selectedPermissions" @update:value="handleUpdateValue" :disabled="disabled">
                                          <n-checkbox
                                            size="small"
                                            class="ml-2"
                                            :label="lodash.startCase(permission.name)"
                                            :value="permission.id"
                                            v-model:checked="value"
                                          />
                                        </n-checkbox-group>
                                    </template>
                                  </n-card>
                                </n-gi>
                              </template>
                            </n-grid>
                            <template #feedback>
                              <span class="text-xs text-red-500" v-if="user.errors['permissions']">
                                {{ user.errors['permissions'] }}
                              </span>
                            </template>
                          </n-form-item>

                          <div class="flex justify-end">
                            <n-button @click="registerUser" type="primary">
                              <template #icon>
                                <n-icon>
                                    <PaperPlaneOutline/>
                                </n-icon>
                              </template>
                              Submit
                            </n-button>
                          </div>
                        </n-form>
                    </n-card>
                </n-modal>
            </div>
        </div>
        <n-data-table ref="dataTableInst" :columns="columns" :data="filteredUsers" :pagination="pagination" />
        <!--Edit User-->
        <n-modal 
          v-model:show="showUser"
          :mask-closable="true"
          >
          <n-card
              style="width: 1000px; margin-top: 50px; margin-bottom: 100px;"
              title="UPDATE USER"
              :bordered="false"
              size="huge"
              role="dialog"                    
              :style="{background: 'white'}"
            >
              <n-form
                  :model="editUser"
                  :label-placement="placement"
                  require-mark-placement="right-hanging"
                  label-width="auto"
                >
                  <!--Name/Email-->
                  <n-grid x-gap="22" :cols="2">
                    <n-gi>
                      <n-form-item label="Full Name">
                        <n-input v-model:value="editUser.name" placeholder="Name"/>
                      </n-form-item>
                    </n-gi>
                    <n-gi>
                      <n-form-item label="Email Address">
                        <n-input v-model:value="editUser.email" placeholder="Email"/>
                      </n-form-item>
                    </n-gi>
                  </n-grid>
                  <!--Password/defaultPassword-->
                  <n-grid x-gap="22" :cols="2">
                    <!--Status-->
                    <n-gi>
                      <n-grid x-gap="22" :cols="1">
                        <n-gi>
                          <n-form-item label="User Status">
                            <n-select
                              filterable
                              placeholder="Select Status"
                              >
                                <template v-if="showRoles" #arrow>
                                    <md-search />
                                </template>
                            </n-select>
                          </n-form-item>
                        </n-gi>
                      </n-grid>
                    </n-gi>
                    <!--Role/Define Access-->
                    <n-gi>
                      <n-grid x-gap="22" :cols="2">
                        <n-gi>
                          <!--Role-->
                          <n-form-item label="Role Name">
                            <n-select
                              v-model:show="showRoles"
                              filterable
                              :options="roleOptions"
                              v-model:value="editUser.role"
                              placeholder="Select an option"
                              @update:value="getSelectedUpdatedRolePermissionById"
                              >
                                <template v-if="showRoles" #arrow>
                                    <md-search />
                                </template>
                            </n-select>
                          </n-form-item>
                        </n-gi>
                        <n-gi>
                          <n-form-item>
                            <!-- <div class="border py-2 px-3 rounded-md w-full flex items-center">
                                <n-checkbox size="medium" class="mr-2"/>
                                <p class="m-0 text-xs">Define Access</p>
                            </div> -->
                            <div class="border py-2 px-3 rounded-md w-full flex items-center">
                              <n-checkbox
                                v-model:checked="checkedHandleDefineAccess"
                                label="Custom Access"
                                @update:checked="handleDefineAccess"
                                @click="disabled = !disabled"
                               
                              />
                            </div>
                          </n-form-item>
                        </n-gi>
                      </n-grid>
                    </n-gi>
                  </n-grid>

                  <!--Permission-->
                  <!-- <n-card  class="mb-4" size="small" :hoverable="true" :bordered="true" :style="{ borderColor: 'var(--grey-300-border-color)' }">
                    <n-checkbox size="small" label="All Access" @click="value = !value" />
                  </n-card> -->

                  <n-grid x-gap="15" y-gap="15" class="mb-5" :cols="3">
                    <template v-for="(permissionsGroup, groupId) in permissions" :key="groupId">
                      <n-gi>
                        <n-card size="small" :hoverable="true" :bordered="true" :style="{ borderColor: 'var(--grey-300-border-color)' }">

                          <!-- <n-checkbox size="small" v-model:checked="value"  :label="permissionsGroup[0].group_name" :disabled="disabled"/> -->
                          <p class="font-bold text-black">{{ permissionsGroup[0].group_name }}</p>

                          <template v-for="permission in permissionsGroup" :key="permission.id">
                              <n-checkbox-group v-model:value="editUser.permissions" @update:value="handleUpdateValue" :disabled="disabled">
                                <n-checkbox
                                  size="small"
                                  class="ml-2"
                                  :label="lodash.startCase(permission.name)"
                                  :value="permission.id"
                                  v-model:checked="value"
                                />
                              </n-checkbox-group>
                              
                              <!-- <n-checkbox-group v-model:value="editUser.selectedPermissions" @update:value="handleUpdateValue" :disabled="disabled">
                                <n-checkbox
                                  size="small"
                                  class="ml-6"
                                  :label="permission.name"
                                  :value="permission.id"
                                  v-model:checked="value"
                                />
                              </n-checkbox-group> -->
                          </template>
                        </n-card>
                      </n-gi>
                    </template>
                  </n-grid>

                  <div class="flex justify-end">
                    <n-button @click="update" type="primary">
                      <template #icon>
                        <n-icon>
                            <Repeat/>
                        </n-icon>
                      </template>
                      Update
                    </n-button>
                  </div>
                </n-form>
            </n-card>
        </n-modal>
		</n-space>
	</CardCodeExample>
</template>

<script>
import { defineComponent, ref, reactive, h, computed } from "vue"
import axios from 'axios'
import { NSpace, NDataTable, NButton, NInput, NIcon, NModal, NCard, NForm, NFormItem, NGrid, NGi, NCheckbox, NCheckboxGroup, NSelect } from "naive-ui"
import MdSearch from "@vicons/ionicons4/MdSearch";
import Add12Filled from "@vicons/fluent/Add12Filled";
import { useAuthStore } from "@/stores/auth"
import { format } from 'date-fns';
import NotepadEdit16Filled from "@vicons/fluent/NotepadEdit16Filled";
import Delete24Filled from "@vicons/fluent/Delete24Filled";
import Swal from 'sweetalert2';
import { PaperPlaneOutline, Repeat } from '@vicons/ionicons5'
import lodash from 'lodash'

const pagination = reactive({
  page: 1,
  pageSize: 6,
  showSizePicker: true,
  simple: false,
  pageSizes: [3, 6, 10],
  onChange: (page) => {
      pagination.page = page
  },
  onUpdatePageSize: (pageSize) => {
      pagination.pageSize = pageSize
      pagination.page = 1
  },
  prefix({ itemCount }) {
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, itemCount);
  return `${startItem}-${endItem} of ${itemCount}`;
  },
})

const dataTableInstRef = ref(null)

export default defineComponent({
  components: { NSpace, NDataTable, NButton, NInput, NIcon, NModal, NCard, NForm, NFormItem, NGrid, NGi, NCheckbox, NCheckboxGroup, NSelect, MdSearch, PaperPlaneOutline, Repeat },
    setup() {
      const users = ref([])
      const showModalRef = ref(false);
      const roles = ref([])
      const permissions = ref([])
      const selectedPermissionsRef = ref(null);
      const roleOptions = ref([]);
      const defaultPasswordChecked = ref(false);
      const checkedRef = ref(false);
      const showUser = ref(false);

      const formatDate = (date) => {
        return date ? format(new Date(date), 'dd/MM/yyyy') : null;
      };

      const getUser = async () => {
        try {
            const url = import.meta.env.VITE_BACKEND_URL +'/api/authentications/user'
            const response = await axios.get(url,  { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            // console.log(response)
            users.value = response.data.users.map(user => {

              const createdAtDate = new Date(user.created_at);
              const formattedDate = formatDate(createdAtDate.toISOString().split('T')[0]);

              const createdAtTime = new Date(user.created_at);
              const formattedTime = createdAtTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const customAccess = user.isCustomAccess;
              const roleName = customAccess === 1 ? user.role.name + " (customized)" : user.role.name;

              return {
                ...user,
                createdDate: formattedDate,
                createdTime: formattedTime,
                customAccess: customAccess,
                roleName: roleName,
              };
            });
        } catch (error) {
            console.error(error)
        }
      }
      getUser()

      const getRoles = async () => {
        try {
            const url = import.meta.env.VITE_BACKEND_URL +'/api/roles/all/roles'
            const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            roles.value = response.data.roles.map(role => {
              // Convert created_at to a Date object
              const createdAtDate = new Date(role.created_at);
              const formattedDate = createdAtDate.toISOString().split('T')[0];

              return {
                ...role,
                createdDate: formattedDate
              };
            });
            // console.log(roles.value)
        } catch (error) {
            console.error(error)
        }
      }
      getRoles()

      const getPermissions = async () => {
        try {
            const url = import.meta.env.VITE_BACKEND_URL + '/api/roles/rolePermission';
            const response = await axios.get(url,  { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            roles.value = response.data.roles;
            permissions.value = response.data.permissions;
            // console.log(response.data.permissions)

            roleOptions.value = response.data.roles.map(role => ({
                label: role.name,
                value: role.id
            }));

        } catch (error) {
            console.error(error);
        }
      };
      getPermissions()

      const searchQuery = ref('');
      const filteredUsers = computed(() => {
        const lowerSearchQuery = searchQuery.value.toLowerCase();
        return users.value.filter(user => 
        user.createdDate.toLowerCase().includes(lowerSearchQuery) ||
        user.name.toLowerCase().includes(lowerSearchQuery) ||
        user.roleName.toLowerCase().includes(lowerSearchQuery) ||
        user.email.toLowerCase().includes(lowerSearchQuery)
        );
      });

      const user = ref({
        name: '',
        email: '',
        password: '',
        password_confirmation:'',
        isCustomAccess: 0,
        errors: {
          name: '',
          email: '',
          password: '',
          password_confirmation:'',
          isCustomAccess: 0,
          role: ''
        }
      });

      const fieldNames = ['name', 'email', 'password', 'role'];

      const statuses = computed(() => {
        const statuses = {};
        for (const fieldName of fieldNames) {
          statuses[fieldName] = user.value.errors[fieldName] ? 'error' : null;
        }
        return statuses;
      });

      const editUser = reactive({
        name: '',
        email: '',
        password: '',
        password_confirmation:'',
        isCustomAccess: '',
        role_id: '',
        selectedPermissions: [],
        permissions: []
      });

      const selectedRolePermissions = reactive({
        selectedPermissions: []
      });

      const getSelectedRolePermissionById = async (id) => {
          try {
              const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/roles/selectedRole/${id}`, {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });

              const permissionData = response.data.permissions;

              if (permissionData && permissionData.length > 0) {
                  const permissionIds = permissionData.map(permission => permission.id);
                  // console.log(permissionIds);

                  selectedPermissionsRef.value = permissionIds
                  // console.log(selectedPermissionsRef)

                  selectedRolePermissions.selectedPermissions = permissionIds;
              } else {
                  console.log('No permissions found for the selected role.');
                  selectedRolePermissions.selectedPermissions = null;
              }
          } catch (error) {
              console.error('Error fetching selected role permissions:', error);
          }
      };

      const getSelectedUpdatedRolePermissionById = async (id) => {
          try {
              const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/roles/selectedRole/${id}`, {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });

              const permissionData = response.data.permissions;

              if (permissionData && permissionData.length > 0) {
                  const permissionIds = permissionData.map(permission => permission.id);

                  selectedPermissionsRef.value = permissionIds
                  editUser.permissions = permissionIds;
              } else {
                  console.log('No permissions found for the selected role.');
                  editUser.selectedPermissions = null;
              }
          } catch (error) {
              console.error('Error fetching selected role permissions:', error);
          }
      };

      const handleCheckedChange = (checked) => {
        defaultPasswordChecked.value = checked;
        if (checked) {
          user.value.password = import.meta.env.VITE_DEFAULT_PASSWORD;
        } else {
          user.value.password = '';
        }
      };

      const registerUser = async () => {
			console.log('Form data:', user.value);
      user.value.errors = {};
      
        try {
          const response = await axios.post(import.meta.env.VITE_BACKEND_URL + '/api/authentications/register',
          {
            name: user.value.name,
            email: user.value.email,
            isCustomAccess: user.value.isCustomAccess,
            password: user.value.password,
            password_confirmation: user.value.password_confirmation,
            role: user.value.role,
            permissions: selectedPermissionsRef.value,
          },
          { 
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
          });
          console.log('API response:', response.data);
          if (response.data.code === 200) {
              Swal.fire({
                width: 380,
                html: '<span class="text-sm">User has been created successfully.</span>',
                icon: 'success',
                confirmButtonText: 'Okay',
                confirmButtonColor: '#0095e8',
                customClass: {
                  content: 'text-sm',
                  confirmButton: 'px-4 py-2 text-white',
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  // useAuthStore().setLogged()
                  window.location.reload();
                }
              });
              showModalRef.value = false;
            } else if(response.data.code === 400) {
              for (const field in response.data.messages) {
                user.value.errors[field] = response.data.messages[field][0];
              }
              showModalRef.value = true;
            }
          } catch (error) {
            console.error('API error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'An error occurred while creating the user.',
            });
          }
      }

      const edit = async (id) => {
        showUser.value = true;

        let url =import.meta.env.VITE_BACKEND_URL +`/api/authentications/selectedUser/${id}`;

        try {
          const response = await axios.get(url,  { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
          console.log("here",response);
          editUser.id = response.data.id || null;
          editUser.name = response.data.name || null;
          editUser.email = response.data.email || null;
          editUser.role = response.data.role.id || null;
          editUser.roleName = response.data.role.name || null;

          //Initial Permission
          const InitialPermissionData = response.data.permissions;

          if (InitialPermissionData && InitialPermissionData.length > 0) {
              const permissionIds = InitialPermissionData.map(permission => permission.id);

              selectedPermissionsRef.value = permissionIds

              editUser.permissions = permissionIds;
          } else {
              console.log('No permissions found for the selected role.');
              editUser.permissions = null;
          }
          //Selected Permission
          const permissionData = response.data.role.permissions;

          if (permissionData && permissionData.length > 0) {
              const permissionIds = permissionData.map(permission => permission.id);

              selectedPermissionsRef.value = permissionIds

              editUser.selectedPermissions = permissionIds;
          } else {
              console.log('No permissions found for the selected role.');
              editUser.selectedPermissions = null;
          }

        } catch (error) {
            console.error(error);
        }
      }

      const update = async () => {
          console.log('Form data:', editUser);
          const selectedUserID = editUser.id;
          console.log('User ID', selectedUserID);

          try {
              const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/authentications/updateUserRolePermission/${selectedUserID}`, {
                  name: editUser.name,
                  email: editUser.email,
                  role: editUser.role,
                  permissions: selectedPermissionsRef.value,
                  isCustomAccess: user.value.isCustomAccess,
              }, {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
              console.log('API response:', response.data);
              Swal.fire({
                  width: 380,
                  html: '<span class="text-sm">User details have been updated successfully.</span>',
                  icon: 'success',
                  confirmButtonText: 'Okay',
                  confirmButtonColor: '#0095e8',
                  customClass: {
                      content: 'text-sm',
                      confirmButton: 'px-4 py-2 text-white',
                  },
              }).then((result) => {
                  if (result.isConfirmed) {
                      window.location.reload();
                  }
              });
              showUser.value = false;
          } catch (error) {
              console.error('API error:', error);

              // Show Swal error message
              Swal.fire({
                  width: 380,
                  html: '<span class="text-sm">Failed to update user details. Please try again.</span>',
                  icon: 'error',
                  confirmButtonText: 'Okay',
                  confirmButtonColor: '#0095e8',
                  customClass: {
                      content: 'text-sm',
                      confirmButton: 'px-4 py-2 text-white',
                  },
              }).then((result) => {
                  if (result.isConfirmed) {
                    showUser.value = true;
                  }
              });
              showUser.value = false;
          }
      };


      const destroy = async (id) => {
        Swal.fire({
          title: 'Are you sure?',
          text: 'You won\'t be able to revert this!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#0095e8',
          cancelButtonColor: '#d9214e',
          confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              let url = import.meta.env.VITE_BACKEND_URL + `/api/authentications/destroy/${id}`;
              const response = await axios.delete(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              });

              if (response.data.code === 200) {
                Swal.fire({
                  width: 380,
                  icon: 'success',
                  confirmButtonText: 'Okay',
                  confirmButtonColor: '#0095e8',
                  customClass: {
                    content: 'text-sm',
                    confirmButton: 'px-4 py-2 text-sm text-white rounded',
                  },
                  html: `<span class="text-sm">${response.data.message}</span>`,
                }).then(() => {
                  window.location.reload();
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'An error occurred while deleting.',
                });
              }
            } catch (error) {
              console.error('API error:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred while deleting.',
              });
            }
          }
        });
      };

      const columns = [
        //No
        {
          title: "No",
          key: "no",
          width: 50,
          render: (row, recordIndex) => {
            const { page, pageSize } = pagination;
            const currentCount = (page - 1) * pageSize + recordIndex + 1;

            return currentCount;
          },
        },
        //Register Date
        {
          title: "Register Date",
          key: "createdDate",
          class: "uppercase",
          resizable: true,
          minWidth: 120,
        },
        //Name
        {
          title: "Full Name",
          key: "name",
          resizable: true,
          minWidth: 180,
        },
        //User Roles
        {
          title: "User Roles",
          key: "roleName",
          resizable: true,
          minWidth: 150,
        },
        //Email
        {
          title: "Email Address",
          key: "email",
          resizable: true,
          minWidth: 200,
        },
        //Action
        {
          title: "Action",
          key: "id",	 
          align: "center",
          width: 90,
          render(row) {
            return h(
              "div",
              { class: "space-x-1" },
              [
                h(
                NIcon,
                {
                  size: "large",
                  onClick: () => edit(row.id),
                  class: "cursor-pointer text-yellow-500 hover:text-yellow-700"
                },
                () => h(NotepadEdit16Filled)
                ),
                h(
                  NIcon,
                  {
                    size: "large",
                    type: "error",
                    onClick: () => destroy(row.id),
                    class: "cursor-pointer text-red-500 hover:text-red-600"
                  },
                  () => h(Delete24Filled)
                )
              ]
            );
          }
        }
        ];

      return {
        statuses,
        lodash,
        searchQuery,
        filteredUsers,
        update,
        editUser,
        showUser,
        checkedHandleDefineAccess: checkedRef,
        disabled: ref(true),
        handleDefineAccess(checkedHandleDefineAccess) {
          checkedRef.value = checkedHandleDefineAccess;
          if(checkedHandleDefineAccess == true)
          {
            user.value.isCustomAccess = 1;
          }
        },
        selectedRolePermissions,
        getSelectedUpdatedRolePermissionById,
        getSelectedRolePermissionById,
        user,
        handleCheckedChange,
        defaultPasswordChecked,
        roleOptions,
        value: ref(false),
        indeterminate: ref(false),
        selectedPermissions: selectedPermissionsRef,
        handleUpdateValue(value) {
          selectedPermissionsRef.value = value;
          console.log(selectedPermissionsRef.value)
        },
        showRoles: ref(false),
        permissions,
        destroy,
        registerUser,
        placement: ref("top"),
        showModal: showModalRef,
        Delete24Filled,
        NotepadEdit16Filled,
        MdSearch,
        Add12Filled,
        dataTableInst: dataTableInstRef,
        columns,
        users,
        pagination
      }
    },
    
})
</script>

<style scoped>
:deep(.slide-left-enter-active),
:deep(.slide-left-leave-active) {
  transition: transform 2s ease, opacity 2s ease;
}

:deep(.slide-left-enter-from),
:deep(.slide-left-leave-to) {
  position: absolute;
  opacity: 0;
}

:deep(.slide-left-enter-from) {
  transform: translateX(-10px);
}

:deep(.slide-left-leave-to) {
  transform: translateX(10px);
}
</style>