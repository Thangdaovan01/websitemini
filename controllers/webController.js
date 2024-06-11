const express = require('express');
// const pool = require('../config/connectDB');

const getLoginPage = async (req, res) => {
    try {
        return res.status(200).render('login');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

const getUserPage = async (req, res) => {
    try {
        return res.status(200).render('user');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}
  
const getHomepage = async (req, res) => {
    try {
        return res.status(200).render('index');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

//Chưa dùng
const getAdminPage = async (req, res) => {
    try {
        return res.status(200).render('admin/homepage');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

const getDocument = async (req, res) => {
    try {
        return res.status(200).render('document');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
} 
const getDocumentFilename = async (req, res) => {
    try {
        return res.status(200).render('documentfile');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

const getMessage = async (req, res) => {
    try {
        return res.status(200).render('messages');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

const getPost = async (req, res) => {
    try {
        return res.status(200).render('post');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

module.exports = {
    getLoginPage, getHomepage,
    getAdminPage, getUserPage,
    getDocument, getDocumentFilename,
    getMessage, getPost
}