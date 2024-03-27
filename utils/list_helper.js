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


const getBest = (blogs, blogCounterFunc) => {
    let noBlogs = {}
    blogs.forEach(b => {
        noBlogs[b.author] = (noBlogs[b.author] || 0) + blogCounterFunc(b)
    })

    return Object.entries(noBlogs).reduce((acc, next)=>{
        return next[1] > acc[1] ? next : acc
    }, ['test', -1])
}


const mostBlogs = (blogs) => {
    if(blogs.length === 0) return null

    const bestBlog = getBest(blogs, b => 1)

    return {
        'author': bestBlog[0],
        'blogs': bestBlog[1]
    }
}   

const mostLikes = (blogs) => {
    if(blogs.length === 0) return null

    const bestBlog = getBest(blogs, b => b.likes)
    
    return {
        'author': bestBlog[0],
        'likes': bestBlog[1]
    }
}


module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }