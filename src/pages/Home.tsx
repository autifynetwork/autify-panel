import React, { useState } from 'react'
import { GraphQLClient, gql } from 'graphql-request'

interface FormValues {
  name: string
  email: string
  isWhitelisted: boolean
}

function Home() {
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    isWhitelisted: false,
  })
  const [formValid, setFormValid] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValues((prevValues) => ({ ...prevValues, [name]: value }))
    setFormValid(validateForm({ ...values, [name]: value }));
    if (name === 'name') {
      setNameError(value.trim() === '' ? 'Name is required' : '');
    }
    if (name === 'email') {
      setEmailError(
        value.trim() === ''
          ? 'Email is required'
          : /\S+@\S+\.\S+/.test(value)
          ? ''
          : 'Invalid email format'
      );
    }
  }
  const handleWhitelistChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = event.target
    setValues((prevValues) => ({
      ...prevValues,
      isWhitelisted: value === 'true',
    }))
  }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // eslint-disable-next-line no-console
    console.log(
      `Name: ${values.name}, Email: ${values.email}, Whitelisted: ${values.isWhitelisted}`
    )
    const mutation = gql`
      mutation PopulateBrand($email: String!, $whitelist: Boolean!) {
        populateBrand(email: $email, whitelist: $whitelist) {
          id
          name
          email
          whitelist
          createdAt
          updatedAt
        }
      }
    `
    const endpoint = 'http://localhost:4000/graphql'
    const client = new GraphQLClient(endpoint)

    try {
      // Make the GraphQL mutation call
      const populateBrand = await client.request(mutation, {
        email: values.email,
        whitelist: values.isWhitelisted,
      })
      // eslint-disable-next-line no-console
      console.log('Brand populated:', populateBrand)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error)
    }
  }
  const validateForm = ({ name, email }: FormValues): boolean => {
    return name.trim() !== '' && email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">
          Name:
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleInputChange}
            className="block my-2 p-2 w-72 border border-gray-400 rounded-md"
          />
          {nameError && <div className="text-red-500">{nameError}</div>}
        </label>
        <label htmlFor="email">
          Email:
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleInputChange}
            className="block my-2 p-2 w-72 border border-gray-400 rounded-md"
          />
          {emailError && <div className="text-red-500">{emailError}</div>}
        </label>
        <label htmlFor="isWhitelisted">
          Whitelisted:
          <select
            name="isWhitelisted"
            value={values.isWhitelisted ? 'true' : 'false'}
            onChange={handleWhitelistChange}
            className="block my-2 p-2 w-72 border border-gray-400 rounded-md"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={!formValid}
          className={`bg-fuchsia-700 text-white px-4 py-2 rounded-md mt-4 focus:outline-none ${
            formValid ? 'hover:bg-violet-600 active:bg-violet-700' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default Home
