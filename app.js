$("#file_input").on("change", e => {

    let file = e.target.files[0]
    var reader = new FileReader();
    reader.onload = function(e) {
        readXml=e.target.result;
        var parser = new DOMParser();
        old_doc = parser.parseFromString(readXml, "application/xml");
        new_doc = parser.parseFromString(readXml, "application/xml");
        trkpts = old_doc.getElementsByTagName("trkpt")
        trkseg = new_doc.getElementsByTagName("trkseg")[0]
        trk = new_doc.getElementsByTagName("trk")[0]
        name = old_doc.getElementsByTagName("name")[0].innerHTML
    }
    reader.readAsText(file);

})

$("#download").on("click", async ()=>{
    let pnts_per_file = $("#points")[0].value
    let pnts_total = trkpts.length
    let files = Math.ceil(pnts_total/pnts_per_file)
    let progress = $("#progress")[0]
    progress.max = files

    var zip = new JSZip();

    for (let i = 0; i < files; i++){

        progress.value = i
        await sleep(0) //Ellers fryser chrome, indtil det er overstået!

        prep_file(new_doc)
        for (let t = i * pnts_per_file; t < (i+1) * pnts_per_file; t++){
            if (t >= pnts_total){continue}
            new_doc.getElementsByTagName("trkseg")[0].appendChild(trkpts[0])
            
            
        }
        
        zip.file(i+1 + ".gpx", new_doc.getElementsByTagName("gpx")[0].outerHTML);

    }

    progress.value = progress.max

    zip.generateAsync({type:"blob"})
        .then(function(zip) {
        saveAs(zip, "archive.zip");
    });

})

function prep_file(doc){

    while(doc.getElementsByTagName("trk").length){
        console.log(doc.getElementsByTagName("trk"))
        let node_to_remove = doc.getElementsByTagName("trk")[0]
        node_to_remove.parentElement.removeChild(node_to_remove)
    }

    let new_trk = doc.createElement("trk")
    let new_trkseg = doc.createElement("trkseg")
    doc.getElementsByTagName("gpx")[0].appendChild(new_trk)
    doc.getElementsByTagName("trk")[0].appendChild(new_trkseg)

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}