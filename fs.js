// 文件操作相关的api
const convertPromise = (thing)=>{
    return new Promise((resolve,reject)=>{
        resolve(thing);
    })
}

const initdir=()=>{
    return Promise.all([LOGDIR,ADVERTDIR].map(path=>global_fs.getDirectory(path,{ create: true, exclusive: false })))
}
const fileInit = ()=>{
    let cwd = null;
    const getfs = () => {
        return new Promise((resolve,reject)=>{
            window.requestFileSystem
            var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            requestFileSystem(window.PERSISTENT, 1024*1024*5, fs=>resolve(fs),fileError=>reject(fileError))
      });
    };
    const touchFile = (path)=>{
        return new Promise((resolve,reject)=>{
            cwd.getFile(path, {create: true},fileEntry=>resolve(fileEntry), err=>reject(err));
        })
    }
    const getFile = (path,option={})=>{
        if(!path.startsWith("file:///")){
            return new Promise((resolve,reject)=>{
                cwd.getFile(path, option, fileEntry=>resolve(fileEntry), err=>reject(err));
            })
        }else {
            return resolveFile(path);
        }
    }
    const getDirectory = (path,option = {})=>{//{ create: true, exclusive: false }
        if(!path.startsWith("file:///")){
            return new Promise((resolve,reject)=>{
            cwd.getDirectory(path, option, dirEntry=>resolve(dirEntry), err=>reject(err));
            })
        }else {
            return resolveFile(path);
        }
    }

    const mkdir = (path)=>{
        return new Promise((resolve,reject)=>{
            cwd.getDirectory(path, {create: true}, dirEntry=>resolve(dirEntry), err=>reject(err));
        })
    }

    const chdir = (path)=>{
        return new Promise((resolve,reject)=>{
            cwd.getDirectory(path, {}, function (dirEntry) {
              cwd = dirEntry;
              // if (fs.onchdir) {
              //   fs.onchdir(cwd.fullPath);
              // }
             resolve();
            }, err=>reject(err));
        })
    }

    if(cwd === null){
        return new Promise((resolve,reject)=>{
                getfs()
                .then(fs=>{
                cwd=fs.root;
                resolve({
                    cwd,getfs,touchFile,
                    getFile,getDirectory,
                    mkdir,chdir
                });
            })
            .catch(e=>{
                reject(e);
            });
        })
    }else {
        return Promise.resolve({
            cwd,getfs,touchFile,
            getFile,getDirectory,
            mkdir,chdir
        });
    }
}

const rmfile = (fileEntry)=>{
    return new Promise((resolve,reject)=>{
         fileEntry.remove(file=>resolve(), err=>reject(err));
    })
}

const deleteFile = (file)=>{
    return resolveFile(file)
    .then(fileEntry=>{
        return rmfile(fileEntry);
    })
}
const resolveFile = (path)=>{
    return new Promise((resolve,reject)=>{
        window.resolveLocalFileSystemURL (path,fileEntry=>resolve(fileEntry),err=>reject(err));
    });
}

const rmdir = (dirEntry)=>{
    return new Promise((resolve,reject)=>{
        dirEntry.removeRecursively(dirEntry=>resolve(), err=>reject(err));
    })
}
const copyfile = (fileEntry,dirEntry)=>{
    return new Promise((resolve,reject)=>{
        fileEntry.copyTo(dirEntry, ()=>resolve(), err=>reject(err));
    })
}
const movefile = (fileEntry,dirEntry)=>{
    return new Promise((resolve,reject)=>{
        fileEntry.moveTo(dirEntry, ()=>resolve(), err=>reject(err));
    })
}
const readfile = (fileEntry)=>{
    return new Promise((resolve,reject)=>{
        fileEntry.file(file=>{
          var reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result)
          };
          reader.readAsText(file);
        }, err=>reject(err));
    })
}
const writefile = (fileEntry,contents,isAppend=false,type='text/plain')=>{
    return new Promise((resolve,reject)=>{
        fileEntry.createWriter(function (fileWriter) {
          var truncated = false;
          fileWriter.onwriteend = function () {
            if (!truncated) {
              truncated = true;
              this.truncate(this.position);
              return;
            }
            resolve()
          };
          fileWriter.onerror = err=>reject(err);
          if (isAppend) {
             try {
                 fileWriter.seek(fileWriter.length);
             }
             catch (e) {
                 console.log("file doesn't exist!");
             }
          }
          fileWriter.write(new Blob([contents], {type}));
        }, err=>reject(err));

   })
};
const readdir = (dirEntry)=>{
    return new Promise((resolve,reject)=>{
          var dirReader = dirEntry.createReader();
          var entries = [];
          readEntries();
          function readEntries() {
            dirReader.readEntries(function (results) {
              if (!results.length) {
                resolve(entries);
              }
              else {
                entries.splice(entries.length,0,...results);
                readEntries();
              }
            }, err=>reject(err));
          }
        });
}
