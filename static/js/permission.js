/**
 * Created by dave on 2017/9/20.
 */
var tree = [
  { id: "aaa" },
  {
    id: "bbb",
    children: [
      {
        id: "ccc",
        children: [
          {
            id: "ddd",
            children: [
              {
                id: "eee",
                children: [
                  { id: "fff" },
                  { id: "ggg" },
                  { id: "hhh" }
                ]
              },
              { id: "iii" },
              { id: "jjj" }
            ]
          },
          { id: "kkk" },
          { id: "lll" },
        ]
      },
      { id: "mmm" },
      { id: "nnn" }
    ]
  },
  { id: "ooo" },
  { id: "ppp" }
];
let ids = ["bbb", "ooo"];
let newTree = [];

function buildTree(tree, ids, newTree){
  if (!tree) { return; }
  for (let i = 0; i< tree.length; i++){
    let val = tree[i];
    console.log(val.id);
    let finder = ids.find(id => id === val.id);
    console.log(finder);
    if(finder !== undefined){
      newTree.push(finder);
      if (val.children) {
        buildTree(val.children, ids, finder.children);
      }
    }
  }
}
buildTree(tree, ids, newTree);
console.log(newTree);

