'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
//const data = require('../db/notes');
//const simDB = require('../db/simDB');
//const notes = simDB.initialize(data);

const knex = require('../knex');

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;

  /*notes.filter(searchTerm)
    .then(list => {
      res.json(list);
    })
    .catch(err => {
      next(err);
    });*/

    knex
  .select('id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .orderBy('notes.id')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error(err);
  });
});

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

/*  notes.find(id)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });*/

	knex
  .first('id', 'title','content')
  .from('notes')
  .where({id: id})
  .then(result => {
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('item not found');
    }
  })
  .catch(err => {
    console.error(err);
  });

});

// Put update an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

/*  notes.update(id, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });*/

knex('notes')
  .update(updateObj)
  .where({id: id})
  .returning(['id', 'title', 'content'])
  .then(result => {
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('item not found');
    }
  })
  .catch(err => {
    console.error(err);
  });


});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  /*notes.create(newItem)
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
      }
    })
    .catch(err => {
      next(err);
    });*/


knex('notes')
  .insert(newItem)
  .returning(['id','title','content'])
  .then(result => {
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('item not found');
    }
  })
  .catch(err => {
    console.error(err);
  });


});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  /*notes.delete(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });*/

knex('notes')
  .where({id: id})
  .del()
  .then(result => {
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('item not found');
    }
  })
  .catch(err => {
    console.error(err);
  });	


});

module.exports = router;
