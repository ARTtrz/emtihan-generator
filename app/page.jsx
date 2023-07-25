import Landing from './components/home/landing';
import NavBar from './components/home/navbar';
import FAQ from './faq/page';

export default function Page() {
  return (
    <>
      <NavBar />
      <Landing />
      <FAQ id='faq' />
    </>
  )
}