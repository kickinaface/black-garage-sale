function GenerateUdid(){
    //var _this = this;
    this.gen = function gen() {
        var udid = [];
        var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
        var numbers = [0,1,2,3,4,5,6,7,8,9];

        // var randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        // var randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
        //console.log('randomLetter: ', randomLetter);
        //console.log('randomNumber: ', randomNumber);
        var blocks = 5;
        var charPerBlock = 5;
        var newUdid;
        for(var b = 1; b<=blocks; b++){
            //console.log('block: ', b);
            udid.push([]);
            for(var i = 1; i<=charPerBlock; i++){
                if(i % 2 == 0){
                    //console.log('randomLetter');
                    udid[b-1] +=(alphabet[Math.floor(Math.random() * alphabet.length)]);
                }else {
                    //console.log('randomNumber');
                    udid[b-1] +=(numbers[Math.floor(Math.random() * numbers.length)]);
                }
                //console.log('char: ',udid[b-1].push(i));
            }

            // for(var f = 1; f<=blocks; f++){
            //     newUdid += (udid[f-1]);
                
            // }
        }
    // console.log(udid.replace(','));
    // console.log(udid);
        var modified = (udid[0]) +('-') + (udid[1]) +('-') + (udid[2] + ('-') + (udid[3]) + ('-') + (udid[4]));
        return modified;
    }
}
// console.log(genudid.modified)

var genudid = new GenerateUdid();
module.exports = genudid;