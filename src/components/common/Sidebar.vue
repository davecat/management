<template>
    <div class="sidebar">
        <!-- Sidebar Menu -->
        <el-menu :default-active="onRoutes" class="el-menu-vertical-demo" theme="dark" unique-opened router>
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
                return this.$route.path.replace('/', '');
            },
            menus() {
                return store.state.menus.menus;
            }
        },
        methods: {

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
