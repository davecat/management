<template>
    <div class="sidebar">
        <!-- Sidebar Menu -->
        <el-menu :default-active="onRoutes" class="el-menu-vertical-demo" theme="dark" unique-opened @select="treeSelect">
            <sidebar-item :routes='menus'></sidebar-item>
        </el-menu>


        <!-- /.sidebar-menu -->
    </div>
</template>

<script>
  import store from '@/store'
    import SidebarItem from "./SidebarItem.vue";
    export default {
        components: { SidebarItem },
        computed: {
            onRoutes(){
//                return this.$route.path.replace('/', '');
              return this.$route.path;
            },
            menus() {
                return store.state.menus.menus;
            }
        },
        methods: {
          treeSelect(index) {
            console.log(index);
            this.axios.get('api/v2/roles/getRolePermission/buttons/'+index).then((res) => {
              store.dispatch('get_button', res.data);
              this.$router.push(index);
            }).catch((error) => {
              this.$message.error(error.response.data.message);
            })
          }
        }
    }
</script>


<style scoped>
    .sidebar {
        display: block;
        position: absolute;
        width: 200px;
        left: 0;
        top: 0;
        bottom: 0;
        background: #2E363F;
    }

    .sidebar > ul {
        height: 100%;
    }

</style>
