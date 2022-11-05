const fs = require("fs");
const path = require("path");

const setNewWatcher = (props) => {
    const NEW_WATCHER = fs.watch(
        filename=props.watcher_dir,
        options={
            recursive: true
        },
    );
    NEW_WATCHER.on("change", (event, file) => {
        console.log({file});        
        console.log({event});
        props.watcher_func();
        const UPDATE_FILE_LOC = file.split("\\");
        console.log(UPDATE_FILE_LOC);
        console.log(path.dirname(UPDATE_FILE_LOC[1]));
        props.window.loadFile(props.update_file);     
    });
}

module.exports = {setNewWatcher};