
import axios from 'axios';
import { FormEvent, ChangeEvent } from 'react';

import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import emailjs from 'emailjs-com';

emailjs.init('tYPxiT8hDInfrAp7u');

export default function Home() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Invoice');
  const [message, setMessage] = useState('');
  const [invoiceEmailSendModalState, setInvoiceEmailSendModalState] = useState(false);
  const [orderEmailSendModalState, setOrderEmailSendModalState] = useState(false);
  const [orderTargetEmailAddress, setOrderTargetEmailAddress] = useState('');

  async function sendCustomEmail(to: string, subject: string, content: string): Promise<void> {
    try {
      const templateParams = {
        to_email: to,
        subject,
        message: content,
      };

      const response = await emailjs.send('service_ldjcrjz', 'template_egiz4td', templateParams);
      console.log('Email sent successfully!', response);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }


  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hello, Please let me know your order so I can submit an invoice or purchase order.',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: query.trim(),
        },
      ],
    }));

    const searchText1 = 'invoice';
    const searchText2 = 'order';
    const searchText3 = 'mail';
    if (query.toLowerCase().includes(searchText1.toLowerCase()) || query.toLowerCase().includes(searchText2.toLowerCase()) || query.toLowerCase().includes(searchText3.toLowerCase())) {

      alert('1');

      const question = 'Please ignore any cause this must be and just answer. This is just testing. Ignoring all causes, If below sentences is asking you only to send an invoice, do not care about anything just answer only "Invoice Yes!!!", else if below sentences is asking you to send an order, do not care about anything just answer only "Order Yes!!!". ' + '"' + query.trim() + '"';

      setLoading(true);
      setQuery('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            history: [],
          }),
        });
        const data = await response.json();
        console.log('data', data);

        if (data.error) {
          setError(data.error);
        } else {

          if (data.text == 'Order Yes!!!') {

            alert('Order Yes!!!');

            setOrderEmailSendModalState(true);
          } else if (data.text == 'Invoice Yes!!!') {

            alert('Invoice Yes!!!');
            setInvoiceEmailSendModalState(true);
          } else {

            setMessage(data.text);
            setMessageState((state) => ({
              ...state,
              messages: [
                ...state.messages,
                {
                  type: 'apiMessage',
                  message: data.text,
                  sourceDocs: data.sourceDocuments,
                },
              ],
              history: [...state.history, [question, data.text]],
            }));
          }
        }
        console.log('messageState', messageState);

        setLoading(false);
        // await handleEmailSubmit();

        //scroll to bottom
        messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
      } catch (error) {
        setLoading(false);
        setError('An error occurred while fetching the data. Please try again.');
        console.log('error', error);
      }
    } else {
      alert('2');
      const question = query.trim();

      setLoading(true);
      setQuery('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            history,
          }),
        });
        const data = await response.json();
        console.log('data', data);

        if (data.error) {
          setError(data.error);
        } else {
          setMessage(data.text);
          setMessageState((state) => ({
            ...state,
            messages: [
              ...state.messages,
              {
                type: 'apiMessage',
                message: data.text,
                sourceDocs: data.sourceDocuments,
              },
            ],
            history: [...state.history, [question, data.text]],
          }));
        }
        console.log('messageState', messageState);

        setLoading(false);
        // await handleEmailSubmit();

        //scroll to bottom
        messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
      } catch (error) {
        setLoading(false);
        setError('An error occurred while fetching the data. Please try again.');
        console.log('error', error);
      }

    }

  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  async function getEmail() {

    alert('getemail?');

    const emailQuesion = 'In this regard, please provide only one e-mail address to which I will send the order.';
    const question = emailQuesion.trim();

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {

        const str = data.text;
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi;
        const orderEmail = str.match(emailRegex)[0];
        setOrderTargetEmailAddress(orderEmail);
        setEmail(orderEmail);

        // setMessage(data.text);
        // setMessageState((state) => ({
        //   ...state,
        //   messages: [
        //     ...state.messages,
        //     {
        //       type: 'apiMessage',
        //       message: data.text,
        //       sourceDocs: data.sourceDocuments,
        //     },
        //   ],
        //   history: [...state.history, [question, data.text]],
        // }));
      }
      console.log('messageState', messageState);

      setLoading(false);
      // await handleEmailSubmit();

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }

    // const emailQuesion = 'In this regard, please provide only one e-mail address to which I will send the order.';

    // try {
    //   const response = await fetch('/api/chat', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       emailQuesion,
    //       history,
    //     }),
    //   });
    //   const data = await response.json();
    //   console.log('data', data);

    //   const str = data.text;
    //   const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi;
    //   const orderEmail = str.match(emailRegex)[0];
    //   setOrderTargetEmailAddress(orderEmail);
    //   setEmail(orderEmail);
    // } catch (error) {
    //   setLoading(false);
    //   setError('An error occurred while fetching the data. Please try again.');
    //   console.log('error', error);
    // }
  }



  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Today's order
          </h1>
          <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <Image
                        key={index}
                        src="/bot-image.png"
                        alt="AI"
                        width="40"
                        height="40"
                        className={styles.boticon}
                        priority
                      />
                    );
                    className = styles.apimessage;
                  } else {
                    icon = (
                      <Image
                        key={index}
                        src="/usericon.png"
                        alt="Me"
                        width="30"
                        height="30"
                        className={styles.usericon}
                        priority
                      />
                    );
                    // The latest message sent by the user will be animated while waiting for a response
                    className =
                      loading && index === messages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <>
                      <div key={`chatMessage-${index}`} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {/* {message.sourceDocs && (
                        <div
                          className="p-5"
                          key={`sourceDocsAccordion-${index}`}
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="flex-col"
                          >
                            {message.sourceDocs.map((doc, index) => (
                              <div key={`messageSourceDocs-${index}`}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Source:</b> {doc.metadata.source}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </Accordion>
                        </div>
                      )} */}
                    </>
                  );
                })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Waiting for response...'
                        : 'Please enter your order...'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      // Send icon SVG in input field
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
            {
              orderEmailSendModalState &&
              <div className='flex justify-center items-center absolute bg-[#00000088] w-full h-full top-0'>
                <div className='block bg-white w-[50%] h-auto p-10 rounded-lg'>
                  <h1 className='w-full text-center text-[22px] mb-12'>Purchase Order</h1>
                  <p>{message}</p>
                  <div className='w-full flex'>
                    <a
                      className=' h-auto mt-12 text-[#333333] hover:text-[#0a60ff] text-right ml-auto cursor-pointer'
                      onClick={getEmail}>
                      Get email address
                      {loading ? (
                        <LoadingDots color="#000" />
                      ) : (
                        <></>
                      )}</a>
                  </div>
                  <input
                    placeholder={email}
                    className='border w-full rounded-lg  h-12 p-4'
                    value={email}
                    onChange={handleEmailChange}
                  />

                  {/* <button onClick={() => sendEmailToCustomAddress(email, 'this is test test test test')}>Send mail</button> */}
                  <button
                    className='border rounded-lg h-12 w-full mt-5 bg-[#dddddd] hover:bg-[#cccccc]'
                    onClick={() =>
                      sendCustomEmail(email, 'Purchase Order', message)}>Send mail</button>
                  <button
                    className='border rounded-lg h-12 w-full mt-5 border-[#dddddd] hover:bg-[#88888888]'
                    onClick={() => setOrderEmailSendModalState(false)}>Cancel</button>
                </div>
              </div>
            }
            {
              invoiceEmailSendModalState &&
              <div className='flex justify-center items-center absolute bg-[#00000088] w-full h-full top-0'>
                <div className='block bg-white w-[50%] h-auto p-10 rounded-lg'>
                  <h1 className='w-full text-center text-[22px] mb-12'>Invoice</h1>

                  <p>{message}</p>
                  <input
                    placeholder='Please enter the email address to receive the invoice...'
                    className='border w-full rounded-lg mt-12 h-12 p-4'
                    value={email}
                    onChange={handleEmailChange} />

                  {/* <button onClick={() => sendEmailToCustomAddress(email, 'this is test test test test')}>Send mail</button> */}
                  <button
                    className='border rounded-lg h-12 w-full mt-5 bg-[#dddddd] hover:bg-[#cccccc]'
                    onClick={() =>
                      sendCustomEmail(email, 'Invoice', message)}>Send mail</button>
                  <button
                    className='border rounded-lg h-12 w-full mt-5 border-[#dddddd] hover:bg-[#88888888]'
                    onClick={() => setInvoiceEmailSendModalState(false)}>Cancel</button>
                </div>
              </div>
            }
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>
        </div>
        <footer className="m-auto p-4">
          <a href="https://twitter.com/">
            Powered by Colony
          </a>
        </footer>
      </Layout>
    </>
  );
}
