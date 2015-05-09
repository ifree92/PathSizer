var fs = require("fs");

var rootPath = "";
var rootDirectories = [];
var rootFiles = [];

function StartSizer(path, callback) {
    rootPath = path;
    if (typeof path == "string") {
        fs.readdir(path, function(err, files){
            if (err) {
                errLog("Error readdir");
            }
            var progressMax = files.length;
            var progressCounter = 1;
            for (var file in files) {
                stat = fs.lstatSync(path + "/" + files[file]);
                if (stat.isDirectory()) {
                    rootDirectories.push(files[file]);
                } else {
                    rootFiles.push({name: files[file], size: stat.size});
                }
            }
            callback();
        });
    }
}

function GetDirectorySize(path) {
    var size = RecurseDirSize(path);
    function RecurseDirSize(curDir) {
        var curSize = 0;
        var curFiles = fs.readdirSync(curDir);
        for (var i in curFiles) {
            try {
                var curStat = fs.lstatSync(curDir + "/" + curFiles[i]);
                    if (curStat.isDirectory()) {
                        curSize += RecurseDirSize(curDir + "/" + curFiles[i]);
                    } else if (curStat.isFile() && !curStat.isBlockDevice() && !curStat.isCharacterDevice() && !curStat.isSymbolicLink() && !curStat.isFIFO() && !curStat.isSocket()) {
                        curSize += curStat.size;
                    }
            } catch(e) {
                console.log("exception: ",curDir + "/" + curFiles[i]);
            }
        }
        return curSize;
    }
    console.log(path + "\t\t" + GetObjectiveSize(size));
    return size;
}

function errLog(msg) {
    console.error("Error: ", msg);
}

if (typeof process.argv[2] == "string") {
    StartSizer(process.argv[2], function(){
            var sumSize = 0;
            for (var i in rootDirectories) {
                sumSize += GetDirectorySize(rootPath + "/" + rootDirectories[i]);
            }
            for (var i in rootFiles) {
                console.log(rootFiles[i].name + "\t\t" + GetObjectiveSize(rootFiles[i].size));
                sumSize += rootFiles[i].size;
            }
            console.log("Total: ", GetObjectiveSize(sumSize));
            console.log("Total: ", sumSize);
            });
} else {
    errLog("Please input a directory");
}

function GetObjectiveSize(size) {
    if (size >= 1000) {
        size /= 1024;
        if (size >= 1000) {
            size /= 1024;
            if (size >= 1000) {
                size /= 1024;
                if (size > 1000) {
                    size /= 1024;
                    return size.toFixed(2) + "T";
                } else {
                    return size.toFixed(2) + "G";
                }
            } else {
                return size.toFixed(2) + "M";
            }
        } else {
            return size.toFixed(2) + "K";
        }
    } else {
        return size.toFixed(2) + "B";
    }
}