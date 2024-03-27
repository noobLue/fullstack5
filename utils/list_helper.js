const dummy = (blogs) => {

    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((acc, nextBlog)=>{
        return acc + nextBlog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    if(blogs.length === 0) return null

    const blog = blogs.reduce((acc, next)=>{
        return next.likes > acc.likes ? next : acc
    }, {likes:-1})

    return {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
    }
}

const mostBlogs = (blogs) => {
    if(blogs.length === 0) return null

    let noBlogs = {}
    blogs.forEach(b => {
        noBlogs[b.author] = (noBlogs[b.author] || 0) + 1
    })

    const bestBlog = Object.entries(noBlogs).reduce((acc, next)=>{
        return next[1] > acc[1] ? next : acc
    }, ['test', -1])

    return {
        'author': bestBlog[0],
        'blogs': bestBlog[1]
    }
}   

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs }