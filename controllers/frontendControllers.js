let message = require('../models/message')
let Slider = require('../models/slider');
let News = require('../models/news');
let Page = require('../models/page');
let nodemailer= require('nodemailer')
let keys = require('../config/keys.js')
let subscribe = require('../models/subscribe')
let Contact = require('../models/contact');


let f = require('../config/frontNav');
let allNews = News.find({});

exports.homePage = function (req, res, next) {
    (async () => {
        let sliders = Slider.find({})
        let mission = Page.find({ tag: 'mission' })
        let vision = Page.find({ tag: 'vision' })
        let objectives = Page.find({ tag: 'objectives' })

        const [sld, mss, vss, obj, news] =
            await Promise.all(
                [sliders, mission, vision, objectives, allNews]
            );

        res.render('frontend/index', {result: sld, mission: mss[0], vision: vss[0], obj: obj[0], doc: news, activeNav: 'home' });
    })()
}

exports.renderPage = function (req, res, next) {
    let navIndex = req.path.substr(1);
    if (typeof f[navIndex] === 'undefined') {
        (async () => {
            const news = await allNews;

            res.render('frontend/404', {activeNav: '', navIndex, doc: news });
        })()
    } else {
        let thisPage = f[navIndex].data;
        let activeNav = f[navIndex].nav;
        (async () => {
            let pageData = Page.find({ tag: thisPage })

            const [dt, news] =
                await Promise.all(
                    [pageData, allNews]
                );

            res.render('frontend/template', { content: dt[0], doc: news, title: navIndex.replace(/(-)+/gi, ' '), activeNav });
        })()
    }
}

exports.servicesPage = function (req, res, next) {
    res.render('extras/services', {});
};

exports.contactPage = function (req, res, next) {
    (async () => {
        let subscribeData = {
            email: req.body.newsletterEmail1,
        }

        let newData = new subscribe(subscribeData);
        newData.save()


        let pageData = Contact.find({})

        const [dt, news] =
            await Promise.all(
                [pageData, allNews]
            );

        res.render('frontend/contact', { content: dt[0], doc: news, activeNav: 'about', gmap_api_key: process.env.GMAP_API_KEY });
    })()
};

exports.newsPage = function (req, res, next) {
    let newsID = req.params.id;
    News.findOne({ _id: newsID })
        .exec()
        .then((oneNews) => {
            News.find({}).exec().then((doc) => {
                if (doc) {
                    res.render('extras/news', {oneNews, doc, activeNav: 'news' })
                } else {
                    res.render('extras/news')
                }
            })
        })
};



exports.newsListsPage = function (req, res, next) {

    News.find({}).then((doc) => {
        if (doc) {
            res.render('extras/news-lists', { doc, activeNav: 'news' })
        } else {
            res.render('extras/news-lists')
        }
    })

};

exports.teamPage = function (req, res, next) {

    News.find({}).then((doc)=>{
        if (doc){
            res.render('frontend/team', { doc, activeNav: 'management' });
            console.log(doc)
        }else{
            res.render('frontend/team', {});
        }
    })
};

exports.post_contactPage =(req, res, next)=>{
    let messageData = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message

    }
    let newData = new message(messageData);
    newData.save()
    Page.find({name: "contactus"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
                    res.render('frontend/contact', {file, doc, activeNav: 'about'});
                }
            })
        }else{
            res.render('frontend/contact');
        }
    })

    // res.render('frontend/contact', {activeNav: 'about'})
    let Transport = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        port: 25,
        auth: {
          user: "phawazzzy@gmail.com",
          pass: keys.keys.password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // let Transport = nodemailer.createTransport({
      //   host: "smtp.mailtrap.io",
      //   port: 2525,
      //   auth: {
      //     user: "f95012fff7abb4",
      //     pass: "01752e418f9181"
      //   }
      // });

      //sending email with SMTP, configuration using SMTP settings
      let mailOptions = {
        from: "LASU ACEITSE - <lasu_citse@gmail.com>", //sender adress
        // to: req.body.userMail,
        to: 'phawazzzy@gmail.com',

        subject: "LASU CITSE",
        html: req.body.message
      };

      Transport.sendMail(mailOptions, (error, info)=>{
        if (error) {
          console.log(error);
          console.log(mailOptions.html);

          //res.send("email could not send due to error:" + error);
        } else {
          console.log(info);
          console.log(mailOptions.html);

          // res.send("email has been sent successfully");
        }
        res.redirect("/contact")
      });

    res.redirect('/contact')


}

exports.subscribe = function (req, res, next){
    let subscribeData = {
        email: req.body.newsletterEmail,
    }

    let newData = new subscribe(subscribeData);
    newData.save()

    res.redirect(req.originalUrl)
}
