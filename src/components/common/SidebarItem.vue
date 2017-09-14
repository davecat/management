<template>
    <div>
        <template v-for="menu in routes">
            <el-menu-item v-if='menu.type=="Menu"' :index="menu.url"><i :class="menu.icon"></i>{{menu.name}}
            </el-menu-item>
            <el-submenu v-else :index="menu.id">
                <template slot="title"><i :class="menu.icon"></i>{{menu.name}}</template>
                <template v-for="child in menu.children">
                    <sidebar-item class='menu-indent' v-if='child.children&&child.children.length>0&&menu.type=="Menu"' :routes='[child]' :key="child.id"></sidebar-item>
                    <el-menu-item  :key="child.id" :index='child.url'>
                        <i :class="child.icon"></i>{{child.name}}
                    </el-menu-item>
                </template>
            </el-submenu>
        </template>
    </div>
</template>

<script>
    export default {
        name: 'SidebarItem',
        props: {
            routes: {
                type: Array
            }
        }
    }
</script>

<style scoped>
    .fa {
        margin-right: 13px;
    }
    .el-submenu .el-menu-item {
      padding: 0 45px!important;
    }
</style>
