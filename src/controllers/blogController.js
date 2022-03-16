
const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");

const createBlog = async function (req, res) {
  try {

    let data = req.body;

    if (data) {
      if (req.body.authorId == req.decodedToken.authId) {


        let unpublishedBlog = await blogModel.create(data);


        if (data.isPublished === true) {

          let publishedBlog = await blogModel.findOneAndUpdate({ _id: unpublishedBlog._id },
            { $set: { publishedAt: Date.now() } }, { new: true })
          return res.status(201).send({ msg: publishedBlog })
        }
        res.status(201).send({ msg: unpublishedBlog });

      }

      else { res.status(403).send({ ERROR: "Only the logged in author can create there blog" }) }
    }
    else { res.status(400).send({ ERROR: "BAD REQUEST" }) }



  } catch (err) {
    res.status(500).send({ ERROR: err.message })
  }
}




const getBlog = async function (req, res) {
  try {


    const data = req.query
    console.log(data)
    const filter = { isDeleted: false, isPublished: true, $and: [data] }
    console.log(filter)


    const blog = await blogModel.find(filter)
    if (blog.length === 0) {
      return res.status(404).send({ status: false, msg: "No blogs found according to the query" })
    }
    return res.status(200).send({ status: true, data: blog })


  }






  catch (err) {
    res.status(500).send(err.message)
  }
}




// update



const updateBlog = async function (req, res) {
  try {


    let blogId = req.params.blogId
    let data = req.body
    let blogToBeModified = await blogModel.findById(blogId)
    if (blogToBeModified) {

      if (blogToBeModified.authorId == req.decodedToken.authId) {


        if (Object.keys(data) != 0) {

          if (blogToBeModified.isDeleted == false) {

            if (data.isPublished === true) {
              let a = await blogModel.findOneAndUpdate({ _id: blogId },
                { $set: { isPublished: true, publishedAt: Date.now() } })
            }

            let updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, { ...data }, { new: true })

            return res.status(202).send({ msg: "Blog updated successfully", updatedBlog })

          }
          else {
            return res.status(404).send({ ERROR: "Deleted blog" })
          }
        }
        else {
          return res.status(400).send({ ERROR: "Bad Request" })
        }


      } else { res.status(403).send({ ERROR: "Author is not authorized to update requested blog" }) }


    } else { res.status(404).send({ ERROR: "Blog not found" }) }
  }



  catch (err) {
    return res.status(500).send({ ERROR: err.message })
  }

}


// delete by id 

let deleteBlogById = async function (req, res) {

  try {
    let id = req.params.blogId

    if (id) {
      let blogToBeDeleted = await blogModel.findById(id)
      if (blogToBeDeleted) {
        if (blogToBeDeleted.authorId == req.decodedToken.authId) {


          let deletedBlog = await blogModel.findOneAndUpdate({ _id: id },
            { $set: { isDeleted: true, deletedAt: Date.now() } })
          res.status(200).send({ status: "Requested blog has been deleted." })
        } else { res.status(403).send({ ERROR: "Author is not authorised to delete requested blog" }) }


      } else { res.status(404).send({ ERROR: "Blog to be deleted not found" }) }

    } else res.status(400).send({ ERROR: 'BAD REQUEST' })


  }
  catch (err) { res.status(500).send({ msg: ERROR, error: err.message }) }


}


//delete by query params

let deletedByQueryParams = async function (req, res) {
  try {

    let data = req.query
    if (Object.keys(data) != 0) {

      let blogsToBeDeleted = await blogModel.find(data).select({ authorId: 1, _id: 1 })
      console.log(blogsToBeDeleted)
      if (blogsToBeDeleted.length != 0) {

        let btbd = blogsToBeDeleted.filter(function (el) { return el.authorId == req.decodedToken.authId })
        console.log(btbd)
        if (btbd != 0) {


          let deletedBlogsFinal = await blogModel.updateMany({ _id: { $in: btbd } },
            { $set: { isDeleted: true, deletedAt: Date.now() } })
          console.log(deletedBlogsFinal)
          res.status(200).send("Requested blog has been deleted")

        } else { res.status(403).send({ ERROR: "The author is not authorised to delete the requested blogs" }) }




      } else { return res.status(404).send({ ERROR: "No Blogs were found" }) }

    } else { res.status(400).send({ ERROR: "Please provide queries" }) }

  }
  catch (err) { res.status(500).send({ ERROR: err.message }) }


}





module.exports.createBlog = createBlog
module.exports.getBlog = getBlog
module.exports.updateBlog = updateBlog
module.exports.deleteBlogById = deleteBlogById
module.exports.deletedByQueryParams = deletedByQueryParams


