const dummy = (blogs) => {

    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((acc, nextBlog)=>{
        return acc + nextBlog.likes
    }, 0)
}

module.exports = { dummy, totalLikes }