<template>
    <div class="wrapper">
        <v-head></v-head>
        <v-sidebar></v-sidebar>
        <!-- Content Wrapper. Contains page content -->
        <div class="content">
            <transition name="move" mode="out-in">
                <router-view></router-view>
            </transition>
        </div>
        <!-- /.content-wrapper -->
    </div>
</template>

<script>
    import vHead from './Header.vue';
    import vSidebar from './Sidebar.vue';
    export default {
        components: {
            vHead, vSidebar
        }
    }
</script>