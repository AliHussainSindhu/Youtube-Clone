function convertToBinary(num)
{
    let binary = [];
    while(num!==1 || num===0)
    {
        binary.unshift(num%2);
        num = Math.floor(num/2);
    }
    if(num!==0)binary.unshift(1);
    else binary.unshift(0);
    return countOnes(binary);
}

function countOnes(binaryNum) {
    
    let num = 0;
    for (let value of binaryNum) {
        if(value===1)num++;
    }
    return num;
}

console.log(convertToBinary(0))