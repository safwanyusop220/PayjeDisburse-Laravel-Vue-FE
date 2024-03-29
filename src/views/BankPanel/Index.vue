<template>
	<CardCodeExample ref="card">
		<n-space vertical :size="12">
        <p class="font-bold text-xl text-black">BANK PANEL</p>
        <div class="flex justify-between">
            <n-input class="mr-[300px]" v-model:value="searchQuery"  placeholder="Search">
              <template #prefix>
                <n-icon :component="MdSearch" />
              </template>
            </n-input>
            
            <div>
              <n-button v-if="isAllowed('create_bank_panel')"  @click="showModal = true" type="success">
                <n-icon :component="Add12Filled" size="17" class="mr-1"/>
                Create
              </n-button>
              <n-modal 
                  v-model:show="showModal"
                  :mask-closable="true"
                  >
                  <n-card
                      style="width: 500px; margin-top: 50px; margin-bottom: 100px;"
                      title="Create Bank Panel"
                      :bordered="false"
                      size="huge"
                      role="dialog"                    
                      :style="{background: 'white'}"
                    >
                      <n-form
                          :model="bankPanel"
                          @submit="submitForm"
                          :label-placement="placement"
                          require-mark-placement="right-hanging"
                          label-width="auto"
                        >
                          <!--Holder Name-->
                          <n-form-item label="Organization Name" :feedback="bankPanel.errors['organization_name']">
                            <n-input v-model:value="bankPanel.organization_name" :status="statuses.organization_name" placeholder="Name"/>
                            <template #feedback>
                              <span class="text-xs text-red-500" v-if="bankPanel.errors['organization_name']">
                                {{ bankPanel.errors['organization_name'] }}
                              </span>
                            </template>
                          </n-form-item>

                          <!--Bank-->
                          <n-form-item label="Bank Name" :feedback="bankPanel.errors['bank_id']">
                            <n-select v-model:show="showBank" filterable :options="bankOptions" v-model:value="bankPanel.bank_id"
                            :status="statuses.bank_id" placeholder="Select an option">
                              <template v-if="showBank" #arrow>
                                <md-search />
                              </template>
                            </n-select>
                            <template #feedback>
                                <span class="text-xs text-red-500" v-if="bankPanel.errors['bank_id']">
                                  {{ bankPanel.errors['bank_id'] }}
                                </span>
                              </template>
                          </n-form-item>
                          
                          <!--Account Number-->
                          <n-form-item label="Account Number" :feedback="bankPanel.errors['account_number']" >
                            <n-input
                              class="w-full"
                              v-model:value="bankPanel.account_number"
                              placeholder="Account"
                              :maxlength="bankPanel.bank_id ? getAccountNumberLength(bankPanel.bank_id) : 0"
                              :status="statuses.account_number"/>
                              <template #feedback>
                              <span class="text-xs text-red-500" v-if="bankPanel.errors['account_number']">
                                {{ bankPanel.errors['account_number'] }}
                              </span>
                            </template>
                          </n-form-item>
                          <div class="flex justify-end mt-[24px]">
                            <n-button @click="submitForm" type="primary">
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
        <n-data-table ref="dataTableInst" :columns="columns" :data="filteredBankPanels" :pagination="pagination" />
		</n-space>
	</CardCodeExample>
</template>

<script>
import { defineComponent, ref, reactive, h, computed } from "vue"
import axios from 'axios'
import { RouterLink } from "vue-router"
import { NSpace, NDataTable, NButton, NInput, NIcon, NModal, NCard, NForm, NFormItem, NSelect } from "naive-ui"
import MdSearch from "@vicons/ionicons4/MdSearch";
import { PaperPlaneOutline } from '@vicons/ionicons5'
import Add12Filled from "@vicons/fluent/Add12Filled";
import NotepadEdit16Filled from "@vicons/fluent/NotepadEdit16Filled";
import Delete24Filled from "@vicons/fluent/Delete24Filled";
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { useAuthStore } from "@/stores/auth"
import { Color } from "maplibre-gl";

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
  components: { NSpace, NDataTable, NButton, NInput, NIcon, NModal, NCard, NForm, NFormItem, NSelect, MdSearch,PaperPlaneOutline},
    setup() {
      const bankPanels = ref([])
      const showModalRef = ref(false);
      const banks = ref([])
      const bankOptions = ref([]);

      const bankPanel = ref({
        organization_name: '',
          bank_id: '',
          account_number: '',
          errors: {
            organization_name: '',
            bank_id: '',
            account_number: '',
          }
      });

      const fieldNames = ['organization_name', 'bank_id', 'account_number'];

      const statuses = computed(() => {
        const statuses = {};
        for (const fieldName of fieldNames) {
          statuses[fieldName] = bankPanel.value.errors[fieldName] ? 'error' : null;
        }
        return statuses;
      });

      const searchQuery = ref('');
      const filteredBankPanels = computed(() => {
        const lowerSearchQuery = searchQuery.value.toLowerCase();
        return bankPanels.value.filter(panel => 
          panel.organization_name.toLowerCase().includes(lowerSearchQuery) ||
          (panel.account_number?.toString() || '').toLowerCase().includes(lowerSearchQuery) ||
          panel.bank.name.toLowerCase().includes(lowerSearchQuery) ||
          (panel.created_at?.toString() || '').toLowerCase().includes(lowerSearchQuery)
          );
      });

      const isAllowed = (permission) => {
        return useAuthStore().isAllowed(permission);
      };

      const formatDate = (date) => {
        return date ? format(new Date(date), 'dd/MM/yyyy') : null;
      };

      const getAccountNumberLength = (bankId) => {
        console.log('bankID', bankId);
        console.log('bank options', bankOptions.value);

        const selectedBank = bankOptions.value.find(bank => bank.value === bankId);
        console.log('result', selectedBank.validation);

        return selectedBank.validation;
      };

      const submitForm = async () => {
        console.log('Form data:', bankPanel.value);
        bankPanel.value.errors = {};

        try {
          const response = await axios.post(
            import.meta.env.VITE_BACKEND_URL + '/api/bank-panel/store',
            bankPanel.value,
            {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            }
          );
          console.log('API response:', response.data);

          if (response.data.code === 200) {
            Swal.fire({
              width: 380,
              html: '<span class="text-sm">Bank Panel created successfully.</span>',
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
            showModalRef.value = false;
          } else if(response.data.code === 400) {
            for (const field in response.data.messages) {
              bankPanel.value.errors[field] = response.data.messages[field][0];
            }
            showModalRef.value = true;
          }
        } catch (error) {
          console.error('API error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred while creating the bank panel.',
          });
        }
      };

      const getBankPanels = async () => {
            try {
                const url = import.meta.env.VITE_BACKEND_URL + `/api/bank-panel?search=${'test'}`
                const response = await axios.get(url,  { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                bankPanels.value = response.data.bankPanels.map(panel => {
                  const createdAtDate = new Date(panel.created_at);
                  const formattedDate = formatDate(createdAtDate.toISOString().split('T')[0]);

                  return {
                    ...panel,
                    createdDate: formattedDate
                  };
                });
                // console.log(bankPanels.value)
            } catch (error) {
                console.error(error)
            }
      }
      getBankPanels()

      const getBanks = async () => {
            try {
                const url = import.meta.env.VITE_BACKEND_URL + '/api/receipients/banks';
                const response = await axios.get(url,  { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
                banks.value = response.data.banks;

                bankOptions.value = response.data.banks.map(bank => ({
                    label: bank.name,
                    value: bank.id,
                    validation: bank.account_number_length
                }));

                // console.log(banks.value);
                // console.log(bankOptions.value);
            } catch (error) {
                console.error(error);
            }
      };
      getBanks()

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
              let url = import.meta.env.VITE_BACKEND_URL + `/api/bank-panel/destroy/${id}`;
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
                  text: 'An error occurred while deleting the bank panel.',
                });
              }
            } catch (error) {
              console.error('API error:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred while deleting the bank panel.',
              });
            }
          }
        });
      };

      // const search = async () => {
      //     try {
      //         const url = import.meta.env.VITE_BACKEND_URL +`/api/bank-panel/search?query=${searchQuery.value}`
      //         const response = await axios.get(url,  { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
              
      //         console.log('search data >>',response)
      //     } catch (error) {
      //         console.error(error)
      //     }
      // }


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
        //Code
        {
          title: "Created Date",
          key: "createdDate",
          class: "uppercase",
          resizable: true,
          minWidth: 120,
        },
        //Organization Name
        {
          title: "Organization Name",
          key: "organization_name",
          resizable: true,
          minWidth: 130,
        },
        //Bank Name
        {
          title: "Bank",
          key: "bank.name",
          resizable: true,
          minWidth: 130,
        },
        //Account Number
        {
          title: "Account Number",
          key: "account_number",
          resizable: true,
          minWidth: 130,
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
                isAllowed('update_bank_panel') ? 
                h(
                  RouterLink,
                  {
                    to: {
                      name: 'Bank-Panel-Edit',
                      params: { id: row.id } 
                    }
                  },
                  () => h(
                    NIcon,
                    {
                      size: "large",
                      type: "warning",
                      class: "cursor-pointer text-yellow-500 hover:text-yellow-600"
                    },
                () => h(NotepadEdit16Filled)
                  )
                ): null,
                isAllowed('delete_bank_panel') ?
                h(
                  NIcon,
                  {
                    size: "large",
                    type: "error",
                    onClick: () => destroy(row.id),
                    class: "cursor-pointer text-red-500 hover:text-red-600"
                  },
                  () => h(Delete24Filled)
                ): null,
              ]
            );
          }
        }
        ];
      return {
        statuses,
        getAccountNumberLength,
        filteredBankPanels,
        searchQuery,
        submitForm,
        destroy,
        bankPanel,
        bankOptions,
        showBank: ref(false),
        placement: ref("left"),
        showModal: showModalRef,
        Delete24Filled,
        NotepadEdit16Filled,
        MdSearch,
        Add12Filled,
        dataTableInst: dataTableInstRef,
        columns,
        bankPanels,
        pagination,
        isAllowed,
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